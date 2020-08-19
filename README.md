# Depends

1. nodejs

# Install

```bash
# npm install 
```

# Run

```bash
$ node app.js
```

# Note

if on linux, enable binding of port 53
```bash
setcap cap_net_bind_service =+ep $(which node)
```

or 

```bash
sudo chown root.root $(which node)
sudo chmod u+s $(which node)
```
