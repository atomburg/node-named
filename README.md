# Depends

1. nodejs

- for  linux
```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

- for windows
[download nodejs](https://nodejs.org/en/download/)

# Install

```bash
# git clone https://github.com/atomburg/node-named
# cd node-named
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
