# IoT Patterns - MQTT + Edge + Dashboard

> **Version**: v1.0 | ATUM CREA
> **Protocole**: MQTT (mqtt.js) - pub/sub lightweight
> **Dashboard**: Next.js + Recharts + Supabase Realtime
> **Edge Processing**: Supabase Edge Functions

---

## Architecture

```
Appareils IoT                  Broker MQTT              Backend
  │                              │                        │
  │  publish topic/data          │                        │
  │ ────────────────────────────>│                        │
  │                              │  Bridge/Webhook        │
  │                              │ ──────────────────────>│
  │                              │                        │  Supabase Edge Function
  │                              │                        │  → Validation
  │                              │                        │  → Transformation
  │                              │                        │  → INSERT en DB
  │                              │                        │
  │                              │                   Dashboard Next.js
  │                              │                   ← Supabase Realtime
  │                              │                   ← Recharts
```

---

## Client MQTT (Node.js/Browser)

```bash
pnpm add mqtt
```

```typescript
// lib/iot/mqtt-client.ts
import mqtt from 'mqtt';

type MQTTConfig = {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
};

export function createMQTTClient(config: MQTTConfig) {
  const client = mqtt.connect(config.brokerUrl, {
    username: config.username,
    password: config.password,
    clientId: config.clientId || `app_${Date.now()}`,
    clean: true,
    reconnectPeriod: 5000,
  });

  return {
    subscribe(topic: string, callback: (payload: any) => void) {
      client.subscribe(topic, { qos: 1 });
      client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic || mqttTopicMatch(topic, receivedTopic)) {
          try {
            callback(JSON.parse(message.toString()));
          } catch {
            callback(message.toString());
          }
        }
      });
    },

    publish(topic: string, data: any) {
      client.publish(topic, JSON.stringify(data), { qos: 1 });
    },

    disconnect() {
      client.end();
    },

    onConnect(callback: () => void) {
      client.on('connect', callback);
    },

    onError(callback: (error: Error) => void) {
      client.on('error', callback);
    },
  };
}

function mqttTopicMatch(pattern: string, topic: string): boolean {
  const patternParts = pattern.split('/');
  const topicParts = topic.split('/');

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === '#') return true;
    if (patternParts[i] === '+') continue;
    if (patternParts[i] !== topicParts[i]) return false;
  }

  return patternParts.length === topicParts.length;
}
```

---

## Edge Function (Processing)

```typescript
// supabase/functions/iot-ingest/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const { deviceId, sensorType, value, timestamp } = await req.json();

  // Validation
  if (!deviceId || !sensorType || value === undefined) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
    });
  }

  // Transformation
  const normalizedValue = typeof value === 'string' ? parseFloat(value) : value;

  // Alertes seuils
  const alerts = checkThresholds(sensorType, normalizedValue);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Insertion
  const { error } = await supabase.from('sensor_readings').insert({
    device_id: deviceId,
    sensor_type: sensorType,
    value: normalizedValue,
    recorded_at: timestamp || new Date().toISOString(),
  });

  // Inserer les alertes si necessaire
  if (alerts.length > 0) {
    await supabase.from('iot_alerts').insert(
      alerts.map((alert) => ({
        device_id: deviceId,
        alert_type: alert.type,
        message: alert.message,
        value: normalizedValue,
      }))
    );
  }

  return new Response(JSON.stringify({ ok: true, alerts: alerts.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function checkThresholds(sensorType: string, value: number) {
  const thresholds: Record<string, { min: number; max: number }> = {
    temperature: { min: -10, max: 50 },
    humidity: { min: 0, max: 100 },
    pressure: { min: 900, max: 1100 },
  };

  const limits = thresholds[sensorType];
  if (!limits) return [];

  const alerts = [];
  if (value < limits.min) alerts.push({ type: 'below_min', message: `${sensorType} below minimum: ${value}` });
  if (value > limits.max) alerts.push({ type: 'above_max', message: `${sensorType} above maximum: ${value}` });

  return alerts;
}
```

---

## Schema DB

```sql
CREATE TABLE sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sensor_device ON sensor_readings(device_id, recorded_at DESC);
CREATE INDEX idx_sensor_type ON sensor_readings(sensor_type, recorded_at DESC);

-- Materialized view pour les stats horaires
CREATE MATERIALIZED VIEW sensor_hourly_stats AS
SELECT
  device_id,
  sensor_type,
  date_trunc('hour', recorded_at) AS hour,
  AVG(value) AS avg_value,
  MIN(value) AS min_value,
  MAX(value) AS max_value,
  COUNT(*) AS reading_count
FROM sensor_readings
GROUP BY device_id, sensor_type, date_trunc('hour', recorded_at);

CREATE UNIQUE INDEX idx_hourly_stats ON sensor_hourly_stats(device_id, sensor_type, hour);
```

---

## Dashboard React

```typescript
// components/iot/sensor-chart.tsx
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createBrowserClient } from '@supabase/ssr';

type SensorReading = {
  value: number;
  recorded_at: string;
};

export function SensorChart({ deviceId, sensorType }: { deviceId: string; sensorType: string }) {
  const [data, setData] = useState<SensorReading[]>([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Charger les donnees historiques
    supabase
      .from('sensor_readings')
      .select('value, recorded_at')
      .eq('device_id', deviceId)
      .eq('sensor_type', sensorType)
      .order('recorded_at', { ascending: false })
      .limit(100)
      .then(({ data: readings }) => {
        if (readings) setData(readings.reverse());
      });

    // Ecouter les nouvelles lectures en temps reel
    const channel = supabase
      .channel(`sensor:${deviceId}:${sensorType}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `device_id=eq.${deviceId}`,
      }, (payload) => {
        if (payload.new.sensor_type === sensorType) {
          setData((prev) => [...prev.slice(-99), payload.new as SensorReading]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [deviceId, sensorType]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="recorded_at" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Checklist

- [ ] Broker MQTT deploye (Mosquitto, HiveMQ, ou EMQX)
- [ ] Edge Function pour l'ingestion et la validation
- [ ] Schema DB avec index temporels
- [ ] Materialized views pour les agregations
- [ ] Dashboard temps reel avec Recharts + Supabase Realtime
- [ ] Alertes sur depassement de seuils
- [ ] Retention policy (archiver/supprimer les anciennes donnees)

---

*Knowledge ATUM CREA | Sources: mqtt.js, Supabase Edge Functions, Recharts*
