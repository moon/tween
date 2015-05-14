A very simple and lightweight JavaScript tweening engine.

```
var target = {value: 0.0};

Tween.to(target, 1.0, {value: 1.0})
  // optional delay
  .wait(0.5)
  // optional easing function
  .ease(Tween.Quint.inOut)
  // attach lifecycle callbacks
  .start(function(){
    console.log('started');
  })
  .step(function(tween){
    console.log('step', tween.progress);
  })
  .done(function(){
    console.log('done');
  })
```