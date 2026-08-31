# Agent Actions Protocol

The agent relies on a strictly typed JSON schema for interaction.

## Supported Actions
1. **`click`**: Clicks a resolved `elementId`.
2. **`type`**: Focuses and types `value` into `elementId`.
3. **`select`**: Selects `value` from a native `<select>` bound to `elementId`.
4. **`scroll`**: Scrolls the page `up`, `down`, `left`, or `right` by a specified `amount`.
5. **`navigate`**: Updates the active tab URL.
6. **`wait`**: Delays execution by specified `milliseconds`.
7. **`keypress`**: Simulates specific keyboard keys (e.g., `Enter`).

Arbitrary JavaScript execution (`eval`, `new Function`) is heavily guarded against and disabled.
