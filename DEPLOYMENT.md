# MindGold Infrastructure & Deployment Guide

This document provides a detailed overview of the server architecture, security setup, resource constraints, and maintenance operations for the MindGold production environment.

---

## 1. Architecture Overview

* **Server OS**: Ubuntu VPS
* **Reverse Proxy**: Native Nginx with Certbot (SSL/HTTPS termination)
* **Containerization**: Docker Compose
* **CI/CD**: GitHub Actions (automated deployment via SSH on push to `main`)

---

## 2. System Hardening & OS Configuration

The host VPS is hardened to prevent system-level resource exhaustion and unauthorized access:

1. **Firewall (UFW)**:
   * **Allowed Ports**: `22` (SSH), `80` (HTTP), `443` (HTTPS).
   * Internal services like Node.js (`3000`) and MongoDB (`27017`) are strictly isolated within the Docker network.
2. **System Logging (Journald)**:
   * `SystemMaxUse=200M` set in `/etc/systemd/journald.conf` to cap system log size.
3. **Swap Memory**:
   * A 1 GB swap file (`/swapfile`) is enabled and configured in `/etc/fstab` to protect against Out-Of-Memory (OOM) crashes.

---

## 3. Container Configuration (`docker-compose.production.yml`)

### `app` Service (`mindgold-api`)
* **Resource Limits**:
  * CPU: `0.50` (50% max usage of a single core)
  * RAM: `500M`
* **Log Rotation (`json-file`)**:
  * `max-size`: `10m`
  * `max-file`: `3` (caps application logs at 30 MB total)

### `mongo` Service (`mindgold-db`)
* **Image**: `mongo:7.0`
* **Persistence**: Docker named volume `mongo-data` mapped to `/data/db`

---

## 4. Operational Cheat Sheet

### Check Server Health & Security
`ufw status && journalctl --disk-usage && free -h`

### Verify Container Logging Configuration
`docker inspect mindgold-api --format='{{json .HostConfig.LogConfig}}'`

### Monitoring & Maintenance Commands
* **Stream real-time API logs**: `docker compose -f docker-compose.production.yml logs -f app`
* **Manually prune dangling Docker images**: `docker image prune -f`