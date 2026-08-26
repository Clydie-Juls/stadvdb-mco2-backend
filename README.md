# Distributed Game Search Engine

A fault-tolerant web application backed by a **three-node distributed MySQL database** for searching and managing a dataset of more than 97,000 Steam games.

The system uses a **multi-master architecture**, horizontal data partitioning, asynchronous replication, transaction logging, conflict resolution, and node-failure recovery to explore the challenges involved in building distributed database systems.

## Architecture

The application consists of three distributed database nodes:

- **Central Node** — contains the complete game dataset
- **Old Games Node** — contains games released before 2010
- **New Games Node** — contains games released in or after 2010

Each node contains:

- a **MySQL database**
- a **Node.js controller**
- an **Express HTTP API** for client/database communication
- a **WebSocket mediator** for inter-node replication and recovery

The frontend communicates with the appropriate node depending on the requested dataset.

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                 HTTP / REST API    │
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼

 ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
 │   Central Node  │      │ Old Games Node  │      │ New Games Node  │
 │                 │      │                 │      │                 │
 │ Node.js / HTTP  │      │ Node.js / HTTP  │      │ Node.js / HTTP  │
 │        │        │      │        │        │      │        │        │
 │      MySQL      │      │      MySQL      │      │      MySQL      │
 └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
          │                        │                        │
          └──────────── WebSocket Replication ─────────────┘
```

The nodes communicate asynchronously through WebSockets to propagate database changes and coordinate recovery.

## Distributed Database Design

The database uses a **multi-master architecture**, allowing reads and writes across all three nodes.

Game data is horizontally partitioned by release year:

| Node | Data |
| --- | --- |
| Central | All games |
| Old Games | Games released before 2010 |
| New Games | Games released in or after 2010 |

Each node uses the same database schema and stored procedures, allowing the controllers to expose a consistent API regardless of which database node handles the request.

UUIDs are used as primary keys to make replicated records independent of node-specific auto-increment sequences.

## Replication

Database mutations are replicated asynchronously between nodes.

When an insert, update, or delete succeeds:

1. The controller records the operation in its transaction log.
2. A UUID identifies the log entry.
3. The node's WebSocket mediator sends the updated log to peer nodes.
4. Receiving nodes compare the incoming log against their local logs.
5. Relevant changes are applied to their local database.
6. Temporarily unavailable nodes receive missed changes after reconnecting.

Because replication is asynchronous, the originating request does not have to wait for every node to acknowledge the change before continuing.

## Partition-Aware Replication

Not every record belongs on every partitioned node.

When a replicated operation arrives, the receiving node determines whether the game belongs to its partition based on its release year.

For example:

```text
release_date < 2010   → Old Games Node
release_date >= 2010  → New Games Node
all records           → Central Node
```

Changes that are not relevant to a node's partition can still be recorded in its replication log without being inserted into that node's database.

The system also handles records moving between partitions. If a game's release year changes across the 2010 boundary, the record can be removed from its previous partition and inserted into the appropriate new partition.

## Concurrency Control

Each MySQL node uses the **REPEATABLE READ** isolation level for local transaction isolation.

Distributed write conflicts are handled by the mediator's log-resolution mechanism.

The system handles scenarios including:

- simultaneous updates to the same record
- simultaneous deletes
- update followed by delete
- delete followed by update
- concurrent operations originating from different nodes

Transaction metadata and timestamps are used during reconciliation to determine which operations should ultimately be reflected across the distributed system.

## Fault Tolerance and Recovery

The application was designed to continue operating when one database node becomes unavailable.

### Frontend Failover

If the preferred node cannot be reached, the frontend can use another available node.

For example:

```text
Old Games Node unavailable
        │
        ▼
Central Node serves old-game data
```

Similarly, if the central node is unavailable, the application can combine data from the old-games and new-games nodes.

This allows database failures to remain largely transparent to the user.

### Backend Recovery

Each node maintains a transaction log containing database mutations.

When a node starts or reconnects:

1. It loads its local transaction log.
2. It contacts another available node.
3. It retrieves that node's log.
4. The two histories are compared.
5. Missing operations are resolved.
6. The recovered operations are applied to the local database.

Nodes also periodically attempt to resend logs to peers that were unavailable when an operation originally occurred.

This allows a temporarily failed node to eventually converge with the rest of the system after returning online.

## API

Each controller exposes REST endpoints for accessing its corresponding database.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/games` | Retrieve games with pagination and name filtering |
| `GET` | `/games/:id` | Retrieve a specific game |
| `GET` | `/games/count` | Count matching games |
| `GET` | `/games/avg-pos-reviews` | Calculate average positive reviews |
| `GET` | `/games/avg-neg-reviews` | Calculate average negative reviews |
| `POST` | `/games` | Insert a game |
| `PUT` | `/games` | Update a game |
| `DELETE` | `/games` | Delete a game |

Requests and responses use JSON.

## Containerized Environment

The distributed system can be reproduced locally using **Docker** and **Docker Compose**.

Each node consists of two containers:

```text
Node
├── MySQL Container
└── Node.js Controller Container
```

Two Docker network layers are used:

```text
app-network
    └── communication between a node's
        controller and MySQL database

shared-network
    └── communication between controllers
        belonging to different nodes
```

The shared external Docker network allows independently launched Docker Compose environments to communicate with one another.

Environment variables configure each node's identity, database connection, controller port, and peer-controller addresses.

## Testing

The system includes automated end-to-end testing using **Playwright**.

Tests exercise both normal distributed operations and failure scenarios.

Failure testing includes intentionally shutting down Docker containers during execution to simulate database-node outages.

Tested scenarios include:

- concurrent reads across multiple nodes
- propagation of updates between nodes
- propagation of deletes
- simultaneous updates to the same record
- simultaneous deletes
- update/delete conflicts
- central-node failure
- partition-node failure
- operations while another node is unavailable
- synchronization after a failed node returns

These tests validate replication, concurrency handling, frontend failover, and backend recovery behavior.

## Tech Stack

**Backend**
- Node.js
- Express.js
- WebSockets (`ws`)
- MySQL / MySQL2
- REST APIs

**Distributed Systems**
- Multi-master architecture
- Horizontal partitioning
- Asynchronous replication
- Transaction logging
- Conflict resolution
- Failure recovery

**Infrastructure**
- Docker
- Docker Compose
- Docker networking
- Azure Container Registry
- Azure CLI

**Testing**
- Playwright

## Dataset

The application uses the **Steam Games Dataset**, containing information for more than **97,000 Steam games**.

Game records include fields such as:

- name
- release date
- price
- positive reviews
- negative reviews

The data is cleaned and partitioned before being loaded into the distributed databases.

## My Contributions

This project was developed collaboratively as a university distributed-database project.

My primary contributions included:

- Designing and configuring the **local multi-container environment**
- Containerizing the database nodes using **Docker and Docker Compose**
- Configuring networking between independently containerized nodes
- Working on **node and database deployment**
- Setting up deployment infrastructure using **Azure**
- Developing and executing distributed-system and failure tests
- Contributing to the project's technical documentation

## What This Project Explores

Building the system highlighted several practical distributed-systems tradeoffs:

- availability vs. consistency
- asynchronous replication complexity
- conflict resolution across independently writable nodes
- recovery after partial system failure
- horizontal data partitioning
- container networking
- distributed-system testing
- deployment complexity

Although production database platforms abstract much of this behavior, implementing these mechanisms directly provided hands-on experience with the problems those systems are designed to solve.

## Authors

Developed as a university project at **De La Salle University**.

- Clyde Julian C. Marindo
- Dalrianne Francesca B. Togado
- Lenz Gio A. Rivera
- Liam Miguel V. Sales
