Reason that SDOM Exists

* LightDOM child nodes must have LightDOM host as `parentNode`
* Nodes must be movable between LightDOM and normal DOM

since

* it's not allowed to override `parentNode` on Safari

then, only non-DOM objects can provide custom `parentNode`

* if `LightDOM.childNodes` returns non-DOM objects, all other nodes must accept non-DOM objects as inputs

therefore

* all DOM elements must be wrapped


