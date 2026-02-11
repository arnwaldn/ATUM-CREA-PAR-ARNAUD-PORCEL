# Multiplayer Architecture

## Models

### Client-Server (Authoritative)
```
Client 1 ─┐
Client 2 ─┼─► Server (authority) ─► State broadcast
Client 3 ─┘
```
- Server validates all actions
- Prevents cheating
- Best for competitive games

### P2P (Peer-to-Peer)
```
Client 1 ◄──► Client 2
    ▲            ▲
    └────────────┘
```
- No server needed
- Higher latency
- Trust issues
- Good for 2-player games

### Relay Server
```
Client 1 ─┐
Client 2 ─┼─► Relay ─► Forward packets
Client 3 ─┘
```
- P2P with NAT traversal
- Lower server compute
- Moderate security

## Tick Rate Recommendations

| Game Type | Server Tick | Client Send |
|-----------|-------------|-------------|
| Shooter   | 60-128 Hz   | 60 Hz       |
| MOBA      | 30-60 Hz    | 30 Hz       |
| MMO       | 10-20 Hz    | 10 Hz       |
| Turn-based| Event-based | Event-based |

## Bandwidth Optimization
- Delta compression
- Interest management
- Entity priority
- Packet batching
