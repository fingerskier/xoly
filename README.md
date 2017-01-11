# xoly
HTMLish client/server language


Core code was gleaned from [node-cfml](https://github.com/Lafougere/node-cfml) by Lafougere


[Docs are in the wiki](https://github.com/fingerskier/xoly/wiki)


###What?

_xoly_ is an HTML-like scripting language like so:
```
<loop from="1" to="3" index="I">
  <img src="flarn" />
</loop>
```

It is extensible via custom tags which can be written in _xoly_ or in _Javascript_.  Integration with _Express_ and CGIish implementations is forthcoming.


###Why?
First, there is a wealth of tools and infrastructure which can be utilized with an HTML compatible system.

Second, the tag basis gives us the code-as-data and composability of a LISP while the tag-attributes add context and meta-data.
