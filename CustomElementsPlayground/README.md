### What

These files form a future-looking JavaScript shim for Custom Web Components. As much as possible we have tried to adhere to the specs, with some exceptions where: things are in flux, polyfilling limitations interfere, or we messed up.

In particular, support for **link rel="components"** (component loader) is supplied in advance of any spec.

### Where

The shim should function in Chrome and Canary. Under any Chromium that supports ShadowDOM, the shim will attempt to use native ShadowDOM, otherwise a ShadowDOM shim is also employed (you can override the ShadowDOM implementation from urls [?shadow=shim|webkit]).

### How

Load *sample/index.html* from a server (it loads other resources, so *file://* won't work by default due to SOP/CORS restrictions).

### Why

So you can play with something approaching a fully featured Custom Web Component engine today. The code in *sample* is attempting to document many of the features we have implemented. 

There is some missing support for inheritance (*extends*) that I carefully avoided in the samples; repair importance is a topic for discussion.

### Who

I'm Scott Miles, sjmiles@google.com.