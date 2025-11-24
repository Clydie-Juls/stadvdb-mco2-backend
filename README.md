# Distributed Game Dataset Database (Master–Replica)

## Overview

This project implements a fault-tolerant distributed database system for storing and analyzing a Games dataset from Kaggle. It uses a master–replica architecture where a primary database handles write operations and one or more replicas perform read queries, aggregation, and failover continuity. ETL scripts ingest raw CSV data, stored procedures enforce consistent logic, and a controller/API layer enables querying the processed records.

All components are deployed using Docker for reproducible execution on any machine or cloud platform (e.g., Azure). The project follows core data-integrity and availability patterns used in enterprise and healthcare systems where correctness, reliability, and replicable deployment are required.

---

## How to Run

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js and Python 3.x

### 1. Clone the Repository
```bash
git clone https://github.com/Clydie-Juls/stadvdb-mco2-backend.git
cd stadvdb-mco2-backend
```

### 2. build the program using docker(must have docker desktop running)
```bash
# Runs docker-compose.yaml and bridge it
# Mac/Linux
docker network create --subnet 192.168.1.0/24 --attachable shared-network
docker compose --env-file central.env -p central up -d --build
docker compose --env-file old.env -p old up -d --build
docker compose --env-file new.env -p new up -d --build

# Windows
init.bat
```

### 3. Run the frontend
```bash
git clone https://github.com/Clydie-Juls/stadvdb-mco2-frontend.git
cd stadvdb-mco2-frontend
npm install
npm run dev
```
