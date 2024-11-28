docker compose --env-file central.env -f sql-only-docker-compose.yaml up -d
docker compose --env-file old.env -f sql-only-docker-compose.yaml up -d
docker compose --env-file new.env -f sql-only-docker-compose.yaml up -d