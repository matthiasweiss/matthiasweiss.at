---
title: ""
description: "Use Laravel as the source of truth for API contracts and routes in a React Native + Expo app with Laravel Data, TypeScript Transformer, and Wayfinder"
publishedAt: "April 15, 2026"
---

# Laravel Backend Post Outline

## 1. Opening: Laravel as the source of truth beyond Inertia

- Brief callback to the [Inertia](https://inertiajs.com/) post
- Frame this as standalone: no prior post required
- Contrast:
  - Inertia: Laravel owns page data inside one app
  - here: Laravel owns contracts across a real API boundary
- Mention [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) explicitly
- State the goal:
  - define contracts once
  - define routes once
  - consume both directly in the client
- Mention that this works especially well because the client is TypeScript

### Possible snippet

```md
Previous post: Laravel as the source of truth for Inertia page data.
This post: Laravel as the source of truth for a [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) app across a real API boundary.
```

---

## 2. The problem: backend/client drift

- Problems to name:
  - duplicated request types
  - duplicated response types
  - duplicated route strings
  - silent drift between backend and mobile app
- Explain why this is harder than Inertia:
  - the frontend is not sitting inside the Laravel app anymore
  - the HTTP boundary is real
- Desired property:
  - renames and structural changes should fail loudly

### Possible snippet

```text
PHP DTO changes
      ↓
generated TypeScript changes
      ↓
React Native code fails to compile where it still expects the old contract
```

---

## 3. Monorepo shape and why it helps

- Keep this practical, not ideological
- Points:
  - backend, mobile, and generated package live together
  - generated artifacts can be reviewed in the same PR
  - no cross-repo package publishing dance
  - backend and app evolve together
- Mention that this is especially convenient for code generation workflows

### Possible snippet

```text
neurofeed/
├── backend/
├── libs/
│   └── types/
├── mobile/
└── package.json
```

### Possible snippet

```json
{
  "scripts": {
    "types": "composer generate-types --working-dir=backend"
  }
}
```

---

## 4. Laravel as the contract source of truth

- Main point:
  - backend already owns validation, transformation, and response structure
- Explain why generating from Laravel is more direct than mirroring types manually
- Mention package names:
  - [`spatie/laravel-data`](https://github.com/spatie/laravel-data)
  - [`spatie/laravel-typescript-transformer`](https://github.com/spatie/laravel-typescript-transformer)
- Mention that request DTOs and response DTOs both matter
- Mention that validation and contract definition living together is a feature

### Possible snippet

```php
#[TypeScript]
#[MapOutputName(SnakeCaseMapper::class)]
class StoreCustomFeedData extends Data
{
    public function __construct(
        #[Nullable]
        #[Max(1000)]
        public ?string $generationPrompt,
        public LanguageEnum $language,
        #[Nullable]
        #[Max(FileUploadConstants::MAX_SIZE_KB)]
        #[Mimes(FileUploadConstants::ALLOWED_EXTENSIONS)]
        #[Prohibits('url')]
        public ?UploadedFile $file,
        #[Nullable]
        #[Url]
        #[Max(2048)]
        #[Prohibits('file')]
        public ?string $url,
    ) {}
}
```

---

## 5. Why [Laravel Data](https://github.com/spatie/laravel-data) for payloads and [Wayfinder](https://github.com/laravel/wayfinder) for routes

- Make the split explicit:
  - Laravel Data owns request/response contracts
  - Wayfinder owns route generation
- Mention this was intentional, not accidental duplication
- Explain the reasoning:
  - direct PHP -> TS path already exists
  - Laravel Data is the more mature choice for rich payload contracts today
  - route strings and params drift too, so route generation matters almost as much as payload generation

### Possible snippet

```json
{
  "require": {
    "laravel/wayfinder": "^0.1.12",
    "spatie/laravel-data": "*",
    "spatie/laravel-typescript-transformer": "^2.5"
  }
}
```

### Possible snippet

```text
Chosen split today:
- payload contracts -> Laravel Data
- route generation -> Wayfinder
```

---

## 6. Generated output: payloads and routes

- Show the payoff from backend-owned DTOs and routes
- Mention:
  - generated TS is concrete source, not just tooling magic
  - nested payloads, enums, unions, and collections remain backend-owned
  - generated route helpers include URL and method information
- Keep this section focused on the artifacts themselves

### Possible snippet

```ts
export type ShowCustomFeedResponseData = {
  id: string;
  userId: number;
  name: string | null;
  description: string | null;
  processedAt: string | null;
  generationPrompt: string | null;
  items: Array<FeedItemData>;
  space: CustomSpaceSummaryData;
  isCompleted: boolean;
};
```

### Possible snippet

```ts
export const show = (
  args:
    | { customFeed: string | { id: string } }
    | [customFeed: string | { id: string }]
    | string
    | { id: string },
  options?: RouteQueryOptions,
): RouteDefinition<"get"> => ({
  url: show.url(args, options),
  method: "get",
});
```

---

## 7. What this feels like in [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)

- Show the client-side payoff
- Mention:
  - generated types are imported directly
  - generated routes are imported directly
  - query code stays close to normal app code
  - less stringly typed API usage
- Make this the practical end-to-end section

### Possible snippet

```ts
import type { ShowCustomFeedResponseData } from "@neurofeed/types";
import { routes } from "@neurofeed/types/routes";

export const customFeedQueryOptions = (
  id: string,
  api: ReturnType<typeof useApi>,
) =>
  queryOptions({
    queryKey: ["custom-feed", id],
    queryFn: () => {
      return api.get<ShowCustomFeedResponseData>(
        routes.customFeeds.show({ customFeed: id }),
      );
    },
  });
```

---

## 8. The generation pipeline

- Show that the workflow is simple enough to be practical
- Mention:
  - one command from the repo root
  - backend generates shared artifacts
  - output lands in `libs/types`
  - mobile imports the result directly

### Possible snippet

```json
{
  "scripts": {
    "generate-types": [
      "@php artisan typescript:transform",
      "@php artisan wayfinder:generate --path=../libs/types --skip-actions",
      "cd ../libs/types && npm run format"
    ]
  }
}
```

### Possible snippet

```text
backend/app/Data + backend/routes
              ↓
       generate shared TS artifacts
              ↓
           libs/types
              ↓
        mobile imports directly
```

---

## 9. Why not OpenAPI

- Keep this short and practical
- Mention:
  - OpenAPI would add another description layer we do not need here
  - PHP -> TS is already directly available
  - generating from actual Laravel DTOs and routes is shorter and closer to the source of truth
- Frame this as a practical choice, not a broad anti-OpenAPI argument

### Possible snippet

```text
Laravel code -> OpenAPI schema -> generated TS client
```

### Possible snippet

```text
Here, we can skip that extra layer and generate directly from the Laravel code that already defines the contract.
```

---

## 10. Backend concerns still stay on the backend

- Keep this brief
- Mention:
  - [Laravel Sanctum](https://laravel.com/docs/sanctum) auth
  - rate limiting
  - protected / expensive endpoints are still enforced server-side
- Explicitly do **not** go deep into AI orchestration or architecture here
- Position that as a separate post

### Possible snippet

```php
Route::prefix('v1')->group(function (): void {
    Route::post('/users', [UserController::class, 'store'])
        ->name('users.store')
        ->middleware('throttle:20,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/custom-spaces', [CustomSpaceController::class, 'store'])
            ->name('custom-spaces.store')
            ->middleware(['throttle:10,1', AuthorizePremiumSubscription::class]);
    });
});
```

---

## 11. Checked-in generated artifacts and public API discipline

- Mention:
  - `libs/types` is committed to git
  - practical reason: [Expo](https://expo.dev/) / [EAS](https://expo.dev/eas) build portability
  - side benefit: generated contract diffs are reviewable in PRs
- Also mention:
  - codegen improves correctness
  - codegen does not replace versioning strategy
  - route and payload changes are still public contract changes

### Possible snippet

```text
PR benefit:
backend contract change + generated artifact diff + mobile fix in one review
```

---

## 12. Conclusion

- End on these points:
  - this is more than Laravel serving JSON
  - Laravel remains the source of truth for contracts and routes
  - monorepo + generated artifacts reduce drift in a practical way
  - this feels like a Laravel-native answer for a TypeScript mobile client

### Possible snippet

```text
Core takeaway:
- contracts defined once
- routes defined once
- backend remains authoritative
- client consumes generated artifacts directly
```

---

## Optional extras

- One visual:
  - DTO field rename -> generated TS change -> React Native compile error
- One small package callout box:
  - [Laravel Data](https://github.com/spatie/laravel-data)
  - [TypeScript Transformer](https://github.com/spatie/laravel-typescript-transformer)
  - [Wayfinder](https://github.com/laravel/wayfinder)
  - [Laravel Sanctum](https://laravel.com/docs/sanctum)
- One short FAQ block:
  - Why not OpenAPI?
  - Why not Wayfinder alone?
  - Why commit generated files?
  - Why monorepo?
- Explicitly leave out for this article:
  - AI orchestration details
  - AI architecture / pipeline design
  - any deeper app-specific backend internals better suited for a follow-up post
