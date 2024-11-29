docker compose --env-file central.env -p central up -d
docker compose --env-file old.env -p old up -d
docker compose --env-file new.env -p new up -d