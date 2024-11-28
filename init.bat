docker compose --env-file central.env -f sql-only-docker-compose.yaml -p central up -d
docker compose --env-file old.env -f sql-only-docker-compose.yaml -p old up -d
docker compose --env-file new.env -f sql-only-docker-compose.yaml -p new up -d