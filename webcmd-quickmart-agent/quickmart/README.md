# webcmd-plugin-quickmart

A webcmd plugin: quickmart

## Install

```bash
# From local development directory
webcmd plugin install file://C:\Users\kvenu\Downloads\webcmd-quickmart-agent\quickmart

# From GitHub (after publishing)
webcmd plugin install github:<user>/webcmd-plugin-quickmart
```

## Commands

| Command | Type | Description |
|---------|------|-------------|
| `quickmart/hello` | Pipeline | Sample pipeline command |
| `quickmart/greet` | TypeScript | Sample TS command with func() |

## Development

```bash
# Install locally for development (symlinked, changes reflect immediately)
webcmd plugin install file://C:\Users\kvenu\Downloads\webcmd-quickmart-agent\quickmart

# Verify commands are registered
webcmd list | grep quickmart

# Run a command
webcmd quickmart hello
webcmd quickmart greet --name World
```
