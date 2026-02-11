// ============================================
// ATUM CREA - Neo4j GraphRAG Schema
// ============================================
// Ce schema definit la structure pour le raisonnement
// relationnel et temporel du systeme de memoire
// Last Updated: 2026-01-02
// ============================================

// ============================================
// CONSTRAINTS - Unicite des identifiants
// ============================================

CREATE CONSTRAINT agent_id IF NOT EXISTS
FOR (a:Agent) REQUIRE a.id IS UNIQUE;

CREATE CONSTRAINT task_id IF NOT EXISTS
FOR (t:Task) REQUIRE t.id IS UNIQUE;

CREATE CONSTRAINT memory_id IF NOT EXISTS
FOR (m:Memory) REQUIRE m.id IS UNIQUE;

CREATE CONSTRAINT skill_name IF NOT EXISTS
FOR (s:Skill) REQUIRE s.name IS UNIQUE;

CREATE CONSTRAINT project_id IF NOT EXISTS
FOR (p:Project) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT fact_id IF NOT EXISTS
FOR (f:Fact) REQUIRE f.id IS UNIQUE;

CREATE CONSTRAINT session_id IF NOT EXISTS
FOR (s:Session) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT file_path IF NOT EXISTS
FOR (f:File) REQUIRE f.path IS UNIQUE;

// ============================================
// INDEXES - Recherche rapide
// ============================================

CREATE INDEX memory_type IF NOT EXISTS
FOR (m:Memory) ON (m.type);

CREATE INDEX memory_created IF NOT EXISTS
FOR (m:Memory) ON (m.created_at);

CREATE INDEX task_status IF NOT EXISTS
FOR (t:Task) ON (t.status);

CREATE INDEX task_type IF NOT EXISTS
FOR (t:Task) ON (t.type);

CREATE INDEX agent_name IF NOT EXISTS
FOR (a:Agent) ON (a.name);

CREATE INDEX fact_valid IF NOT EXISTS
FOR (f:Fact) ON (f.valid_from, f.valid_until);

CREATE INDEX skill_rate IF NOT EXISTS
FOR (s:Skill) ON (s.success_rate);

// ============================================
// NODE DEFINITIONS (avec proprietes)
// ============================================

// Agent - Entite qui execute des taches
// (:Agent {
//   id: string,
//   name: string,
//   type: string (core|specialist|super),
//   status: string (active|idle|error),
//   created_at: datetime,
//   last_active: datetime,
//   task_count: integer,
//   success_rate: float
// })

// Task - Unite de travail
// (:Task {
//   id: string,
//   type: string,
//   description: string,
//   status: string (pending|in_progress|completed|failed),
//   priority: string (low|normal|high|critical),
//   created_at: datetime,
//   started_at: datetime,
//   completed_at: datetime,
//   duration_ms: integer,
//   error: string
// })

// Memory - Unite de connaissance stockee
// (:Memory {
//   id: string,
//   type: string (fact|preference|task_result|skill),
//   content: string,
//   confidence: float,
//   created_at: datetime,
//   accessed_at: datetime,
//   access_count: integer,
//   source: string
// })

// Skill - Competence procedurale apprise
// (:Skill {
//   name: string,
//   description: string,
//   recipe: [string],
//   success_rate: float,
//   total_uses: integer,
//   last_used: datetime,
//   improvements: [string]
// })

// Project - Projet de developpement
// (:Project {
//   id: string,
//   name: string,
//   path: string,
//   type: string (saas|landing|api|mobile),
//   created_at: datetime,
//   last_modified: datetime,
//   status: string
// })

// Fact - Information factuelle avec validite temporelle
// (:Fact {
//   id: string,
//   content: string,
//   valid_from: datetime,
//   valid_until: datetime,
//   confidence: float,
//   source: string,
//   superseded: boolean
// })

// Session - Session de conversation
// (:Session {
//   id: string,
//   started_at: datetime,
//   ended_at: datetime,
//   message_count: integer,
//   summary: string
// })

// File - Fichier du projet
// (:File {
//   path: string,
//   name: string,
//   type: string,
//   created_at: datetime,
//   modified_at: datetime,
//   size_bytes: integer
// })

// ============================================
// RELATIONSHIP DEFINITIONS
// ============================================

// Agent relationships
// (Agent)-[:EXECUTED {timestamp, duration_ms}]->(Task)
// (Agent)-[:HAS_SKILL]->(Skill)
// (Agent)-[:CREATED]->(Memory)
// (Agent)-[:PART_OF]->(Session)

// Task relationships
// (Task)-[:PRODUCED]->(Memory)
// (Task)-[:USED_SKILL]->(Skill)
// (Task)-[:DEPENDS_ON]->(Task)
// (Task)-[:MODIFIED]->(File)
// (Task)-[:PART_OF]->(Project)

// Memory relationships
// (Memory)-[:RELATED_TO {strength: float}]->(Memory)
// (Memory)-[:DERIVED_FROM]->(Memory)
// (Memory)-[:ABOUT]->(Project)

// Fact relationships
// (Fact)-[:SUPERSEDED_BY]->(Fact)
// (Fact)-[:VALID_IN]->(Context)
// (Fact)-[:CONTRADICTS]->(Fact)

// Skill relationships
// (Skill)-[:IMPROVES]->(Skill)
// (Skill)-[:REQUIRES]->(Skill)

// Project relationships
// (Project)-[:CONTAINS]->(File)
// (Project)-[:USES]->(Skill)

// ============================================
// SAMPLE QUERIES
// ============================================

// Historique d'execution d'un agent
// MATCH path = (a:Agent {name: 'code-generator'})-[:EXECUTED]->(t:Task)-[:PRODUCED]->(m:Memory)
// WHERE t.created_at > datetime() - duration('P7D')
// RETURN path
// ORDER BY t.created_at DESC
// LIMIT 20;

// Skills les plus efficaces
// MATCH (s:Skill)<-[:USED_SKILL]-(t:Task)
// WHERE t.status = 'completed'
// RETURN s.name, count(t) as uses, s.success_rate as rate
// ORDER BY rate DESC, uses DESC
// LIMIT 10;

// Faits valides actuellement
// MATCH (f:Fact)
// WHERE f.valid_from <= datetime()
// AND (f.valid_until IS NULL OR f.valid_until > datetime())
// AND f.superseded = false
// RETURN f.content, f.confidence, f.source
// ORDER BY f.confidence DESC;

// Chemin de dependance des taches
// MATCH path = (t1:Task)-[:DEPENDS_ON*1..5]->(t2:Task)
// WHERE t1.id = $taskId
// RETURN path;

// Memories liees par force de relation
// MATCH (m1:Memory)-[r:RELATED_TO]->(m2:Memory)
// WHERE m1.id = $memoryId AND r.strength > 0.7
// RETURN m2.content, r.strength
// ORDER BY r.strength DESC;

// Activite par session
// MATCH (s:Session)<-[:PART_OF]-(a:Agent)-[:EXECUTED]->(t:Task)
// WHERE s.id = $sessionId
// RETURN a.name, count(t) as tasks, collect(t.type) as task_types;

// ============================================
// MAINTENANCE QUERIES
// ============================================

// Nettoyer les faits obsoletes (> 90 jours et non accedes)
// MATCH (f:Fact)
// WHERE f.valid_until < datetime() - duration('P90D')
// AND f.access_count < 2
// DELETE f;

// Mettre a jour les taux de succes des agents
// MATCH (a:Agent)-[:EXECUTED]->(t:Task)
// WITH a, count(t) as total,
//      sum(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as success
// SET a.success_rate = toFloat(success) / total,
//     a.task_count = total;

// Identifier les memories orphelines
// MATCH (m:Memory)
// WHERE NOT (m)<-[:PRODUCED]-() AND NOT (m)-[:RELATED_TO]-()
// AND m.created_at < datetime() - duration('P30D')
// RETURN m.id, m.content;

// ============================================
// END OF SCHEMA
// ============================================
