Icon as help callout
```
<div>
    Simple callout<HelpCallout content="A description" />
</div>
```

Hoverable text with icon
```javascript
<HelpCallout content="A description">Hoverable</HelpCallout>
```

Hoverable text
```javascript
<HelpCallout content="A description" withoutIcon>Hoverable</HelpCallout>
```

```javascript
const Anchor = require('../Anchor').default;
<HelpCallout content="A description">
  <Anchor type="text">Hoverable</Anchor>
</HelpCallout>
```

```javascript
const Anchor = require('../Anchor').default;
const HelpIcon = require('./styles/HelpIcon').default;
<HelpCallout content="A description" withoutIcon>
  <Anchor type="text">Hoverable<HelpIcon name="help" /></Anchor>
</HelpCallout>
```
