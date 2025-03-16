---
title: "Bulletproofing Inertia: How I maximize Type Safety in Laravel Monoliths"
description: "TODO"
publishedAt: "March 18, 2025"
---

My go-to stack for building web applications is Laravel, Inertia and React. Since I have a pretty solid TypeScript
background, I'm always trying to improve the type safety & robustness of my projects. I've landed on a setup that
I'm very happy with, and I think it's worth sharing.

In my opinion, the main highlight of this setup is the type safety between the Laravel controllers in the backend
and the properties of the Inertia pages on the frontend. The GIF below shows an example where a property is
renamed in a data class, which immediately causes an error in the PHP code, due to the use of named arguments,
as well as the TypeScript code, due to the type mismatch.

![](./assets/02_type_generation.gif)

BTW: creating this GIF was a huge pain, since I had to make the font on my screen insanely large, do not recommend. 🤯

So how does this work? The main work is done by two packages:

- [Laravel Data](https://github.com/spatie/laravel-data/pulls) allows creating rich data objects, which for me replace both form requests and resources.
- [TypeScript Transformer](https://github.com/spatie/laravel-typescript-transformer) transforms these rich data objects into TypeScript types.

Both packages are installed through composer. I recommend publishing the config file of the TypeScript Transformer package, since
you might need to comment out the `Spatie\TypeScriptTransformer\Transformers\SpatieEnumTransformer` transformer.

```sh
composer require spatie/laravel-data spatie/laravel-typescript-transformer

# Optional
php artisan vendor:publish --provider="Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerServiceProvider"
```

I then create a data class for each Inertia view, the example shown in the GIF is

```php
<?php

namespace App\Data;

use Inertia\DeferProp;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript()]
class DashboardData extends Data
{
    public function __construct(
        /** @var array<PostData> */
        public array $myLatestPosts,
        public DeferProp|FeedData $feed,
    ) {}
}
```

Within my controller I then create an instance of this data class with the given properties and pass it to the inertia view.

```php
<?php

namespace App\Http\Controllers;

use App\Data\DashboardData;
use App\Queries\FeedQuery;
use App\Queries\LatestPostsQuery;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(LatestPostsQuery $latestPostsQuery, FeedQuery $feedQuery): Response
    {
        $data = new DashboardData(
            myLatestPosts: $latestPostsQuery->get(),
            feed: Inertia::defer(fn () => $feedQuery->get()),
        );

        return inertia('dashboard/dashboard', $data);
    }
}
```

Using [deferred props](https://inertiajs.com/deferred-props) is not supported out of the box with these packages. The way
I made it work is by adding a default type replacement for the `Inertia\DeferProp` in the `config/typescript-transformer.php`
file, which was published earlier, and type hinting deferred props as `DeferProp|FeedData` in the data class. This way the
generated type is `null|FeedData`, which matches the behavior of deferred props.

```php
'default_type_replacements' => [
    ...
    Inertia\DeferProp::class => 'null',
],
```

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

The next step is actually using the generated types in our React components. I usually extend the `SharedData` type
provided by the Laravel starter kit.

```tsx
import { SharedData } from '@/types';

type DashboardProps = SharedData & App.Data.DashboardData;

export default function Dashboard(props: DashboardProps) {
    ...
}
```

The `SharedData` type contains everything included in the return value of the `share` method in Inertia's
`HandleInertiaRequests` middleware. Since this usually includes the authenticated user, we should also
create a data object for the user model and use it within here. This might be as simple as the example below.

```php
<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public function __construct(
        public int $id,
        public string $email,
        public string $name,
    ) {}
}
```

Using the data object within the middleware is straightforward. We need to check whether the user is authenticated,
otherwise we pass null to the constructor of the data object, which would result in an exception.

```php
<?php

namespace App\Http\Middleware;

use App\Data\UserData;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    ...

    public function share(Request $request): array
    {
        $user = $request->user()
            ? UserData::from($request->user())
            : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
        ];
    }
}
```
