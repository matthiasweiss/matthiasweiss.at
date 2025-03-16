---
title: "Bulletproofing Inertia: How I maximize Type Safety in Laravel Monoliths"
description: "TODO"
publishedAt: "March 18, 2025"
---

[Laravel Data](https://github.com/spatie/laravel-data/pulls)
[TypeScript Transformer](https://github.com/spatie/laravel-typescript-transformer)

Once this is set up, the `php artisan typescript:transform` can be used to generate type definitions from your data classes.
Since I like to write the types to a different path, I usually add a custom script to my `composer.json` file.

```php
...
"scripts": {
    ...
    "transform-types": [
        "@php artisan typescript:transform --output js/types/generated.d.ts"
    ]
},
```

This allows me to simply run `composer run transform-types`, instead of adding the `--output js/types/generated.d.ts` flag
every time. I typically choose this output file, so the generated types are located in the same folder as the default
types provided by the Laravel starter kit.
