## Adding locale

Create locale folder in `src/providers`.

Create specific providers inside of locale folder, it should have same name as base provider.

Locale-specific provider will be extended from base provider and will have all its properties.

Three is three things you can override or add:

- dictionaries (leave formats and algorithms, just change dictionaries)
- formats (leave dictionaries and algorithms, just change formats)
- generators (change generator algorithm at all)

It should be pretty straightforward after looking at examples:

- [Add locale specific generators](https://github.com/boo1ean/casual/blob/master/src/providers/en_US/address.js)
- [Just override dictionaries](https://github.com/boo1ean/casual/blob/master/src/providers/ru_RU/text.js#L2)
- [Tweak most of the stuff!](https://github.com/boo1ean/casual/blob/master/src/providers/ru_RU/address.js)

To view generator results you can use help util:

```
	node utils/show.js internet -l ru_RU
```

For details see [usage](https://github.com/boo1ean/casual/blob/master/utils/usage.txt)