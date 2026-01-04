# Security Baseline Checklist

Before exposing your server to the internet, perform these hardening steps.

## 1. SSH Hardening
Edit `/etc/ssh/sshd_config`:

```ssh
# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no
ChallengeResponseAuthentication no

# Change default port (optional, e.g., 2222)
# Port 2222
```

**Restart SSH:**
```bash
sudo service ssh restart
```
> ⚠️ **Warning:** Ensure you have added your SSH key (`~/.ssh/authorized_keys`) and tested the connection in a new terminal **before** closing your current session.

## 2. Firewall (UFW)
Deny all incoming traffic by default, then allow only essential ports.

```bash
# Install UFW
sudo apt install ufw

# Set defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if you changed it)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable Firewall
sudo ufw enable
```

## 3. Fail2Ban
Install Fail2Ban to ban IPs that show malicious signs (too many password failures, etc.).

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 4. Docker Security
- **Do not expose ports globally**: Ensure database (5432) and Redis (6379) ports is NOT mapped in `docker-compose.yml` or are bound to `127.0.0.1`.
- **Run as non-root**: Where possible, configure containers to run as non-privileged users.
