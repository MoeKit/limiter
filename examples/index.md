# Demo

---

## Normal usage


````html
<textarea id="textarea"></textarea>
<div id="rs"></div>
````

````javascript
seajs.use('index', function(Limiter) {
    new Limiter({
    target:'#textarea',
    rsBox:'#rs',
    max:20,
    isCut:true,
    mode:'en2half'
    });
});
````
