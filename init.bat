docker network create --subnet 192.168.1.0/24 --attachable shared-network
docker compose --env-file central.env -p central up -d --build
docker compose --env-file old.env -p old up -d --build
docker compose --env-file new.env -p new up -d --build