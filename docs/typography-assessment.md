# Disco Stu Typography Assessment

Date: 2026-05-03

## Summary

The app has a strong visual identity, especially on the public landing page, but the authenticated product UI does not yet read as a typography system. Most typography decisions are made inline with Chakra props, so repeated surfaces solve the same hierarchy problems in slightly different ways.

The main recommendation is to preserve the expressive `Monoton`/animated "Disco Stu" mark as a one-off brand treatment on the landing page, then standardize the rest of the app around semantic text roles. The working product should feel dense, quick to scan, and calm: music titles, artists, metadata, controls, dialogs, and list rows should reuse the same few roles instead of accumulating local size and weight choices.

## Current Audit

### System Shape

- Typography is not centralized in `theme/ChakraProvider.tsx`; the theme currently normalizes button and input styling, but not text roles.
- The app uses Chakra defaults for many `Heading`, `Text`, `Dialog.Title`, `Button`, `Tag`, `Table`, and `Input` instances.
- Explicit treatments are scattered through components with `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` props.
- Current explicit sizes include `xs`, `sm`, `md`, `xl`, responsive `4xl` through `7xl`, and raw CSS alias `small`.
- Current explicit weights include `light`, `normal`, `semibold`, and `bold`.

### Intentional Variety

- Landing brand: `app/page.tsx` uses `Monoton`, animated color, and very large responsive sizing for "Disco Stu". This is appropriate as a brand/display exception.
- Landing headline: `app/page.tsx` uses oversized responsive display typography for the public-facing value proposition. This can stay outside the dense product scale, but should be named as a display role if reused.
- Dense action labels: `components/SpotifyTracks.tsx` uses `xs` plus tight `lineHeight="1.1"` for stacked icon button labels. The compactness is intentional, but the role should be centralized.

### Accidental Variety

- Track cards and playlist modals use `fontSize="small"` while nearby rows use Chakra token sizes such as `sm` and `xs`. `small` should be replaced with tokenized roles.
- Item titles sometimes rely on bare `Text`, sometimes `fontWeight="bold"`, and sometimes `Heading size="md"`, even when the visual job is similar.
- Metadata is usually smaller and muted, but not consistently: examples include `fontSize="xs" color="gray.400"`, `fontSize="sm" color="gray.400"`, `fontSize="small" color="whiteAlpha.700"`, and bare muted `Text`.
- Dialog and popover typography mostly depends on Chakra defaults, while some children override local sizes. This makes dialogs feel less connected to the rest of the product UI.
- Utility labels such as filter labels, tempo labels, share-link labels, cover captions, and status messages are all close in function but use local `xs`, `sm`, or inherited sizes.

## Proposed Type System

Use Chakra `textStyles` as the primary API. Components should request semantic roles with `textStyle` instead of choosing sizes and weights directly.

| Role | Intended Use | Size | Weight | Line Height | Color Guidance |
| --- | --- | --- | --- | --- | --- |
| `brandDisplay` | Landing "Disco Stu" mark only | responsive `4xl` to `7xl` | `normal` | `1` | custom animated class |
| `displayTitle` | Landing headline only | responsive `4xl` to `7xl` | `bold` | `1.05` | `white` |
| `displayBody` | Landing support copy | responsive `md` to `xl` | `normal` | `1.5` | `whiteAlpha.800` |
| `pageTitle` | Main page or major content title | `2xl` | `semibold` | `1.2` | `white` |
| `sectionTitle` | Sidebar, detail panel, dialog section headers | `md` | `semibold` | `1.25` | `whiteAlpha.900` |
| `itemTitle` | Track, album, collection, playlist, artist names | `sm` | `semibold` | `1.3` | `whiteAlpha.900` |
| `itemMeta` | Artist names, album names, follower counts, durations | `xs` | `normal` | `1.35` | `gray.400` or `whiteAlpha.600` |
| `body` | Standard paragraphs and empty states | `sm` | `normal` | `1.5` | `whiteAlpha.800` |
| `controlLabel` | Button text, switch labels, tag labels, compact form labels | `sm` | `semibold` | `1.25` | inherit from control |
| `microLabel` | Stacked icon labels, field labels, captions, tooltips | `xs` | `medium` | `1.15` | `whiteAlpha.700` or inherit |
| `dialogTitle` | `Dialog.Title`, bottom sheet title | `md` | `semibold` | `1.25` | `white` |
| `statusText` | Loading, empty, and error helper text | `sm` | `normal` | `1.4` | `whiteAlpha.700` or semantic error color |

## Mapping Guidance

- `app/page.tsx`: keep the brand treatment and landing headline as special display roles; change landing support copy from `fontWeight="light"` to normal weight for better legibility.
- `components/SpotifyTracks.tsx`: map track name to `itemTitle`, artist line to `itemMeta`, and stacked action labels to `microLabel`. Replace `fontSize="small"`.
- `components/SpotifyTrackDetailView.tsx`: map `Track Details`, `Discography`, and artist heading to `sectionTitle` or `pageTitle` depending on hierarchy; map album rows and track rows to `itemTitle`/`itemMeta`.
- `components/SpotifyPlaylists.tsx`: map sidebar title to `sectionTitle` and playlist rows to `itemMeta` or a sidebar-specific `itemTitle` if stronger contrast is needed.
- `components/SpotifyAutocomplete.tsx`: map input and result names to `itemTitle`; loading, empty, and error rows to `statusText`; the new-search prompt should be a named empty-state style rather than a one-off `xl`.
- `components/SpotifyShareCollectionButton.tsx`, `components/SpotifyAddToPlaylistMenu.tsx`, `components/ui/BottomSheet.tsx`, and dialogs: map titles to `dialogTitle`, descriptions to `body`, field labels/captions to `microLabel`, and rows to `itemTitle`.
- `components/SpotifyCollectionCard.tsx`: map collection titles to `itemTitle` with card-specific truncation, and owner text to `itemMeta`.
- `components/SpotifyRecommendationFilters.tsx`, `components/SpotifyTempoFilter.tsx`, and `components/SpotifySeeds.tsx`: map switch/tag/filter labels to `controlLabel` or `microLabel`; avoid local responsive font-size props unless a control genuinely changes density by breakpoint.
- `app/privacy-policy/page.tsx`: use `pageTitle` for the heading and `body` for paragraphs/list copy. This page can be more readable than the product UI, but should still use the same base roles.

## Implementation Notes For A Future Pass

1. Add `textStyles` to `theme/ChakraProvider.tsx` with the roles above.
2. Migrate repeated call sites from direct `fontSize`, `fontWeight`, and `lineHeight` props to `textStyle`.
3. Replace all `fontSize="small"` with tokenized roles.
4. Keep local overrides only for truncation, text transform, responsive layout, and true brand/display exceptions.
5. After migration, avoid introducing new inline typography props unless a new role is added to the system.

Example target usage:

```tsx
<Text textStyle="itemTitle" lineClamp={1}>
  {track.name}
</Text>
<Text textStyle="itemMeta" lineClamp={1}>
  {artistNames}
</Text>
```

## Validation Checklist

- Desktop and mobile: landing page still has a distinctive brand moment without leaking display styling into the product UI.
- Search/results: every track card uses the same title, metadata, and micro action-label roles.
- Track detail: artist, album, track rows, durations, and sidebar card content form one consistent hierarchy.
- Sidebar: playlist title and rows are scannable without competing with main content.
- Dialogs, popovers, and bottom sheets: titles, descriptions, labels, and rows match product roles.
- Empty, loading, and error states use one status style family.
- No remaining `fontSize="small"` in app components after the future migration.
- New exceptions are documented in the type system rather than added inline.

