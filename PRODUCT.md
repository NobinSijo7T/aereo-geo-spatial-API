# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js App Router with TypeScript and Tailwind CSS, added as a separate `frontend/` app beside the existing FastAPI backend.

## Users

Technical users evaluating or operating the AEREO geospatial measurement API who need to upload a KML or zipped Shapefile and inspect feature-level measurements.

## Product Purpose

Geospatial Measurement Studio provides a focused workspace for uploading supported geospatial files, seeing their processing status and metadata, and reviewing accurate area or length measurements returned by the FastAPI service.

## Capabilities and Constraints

The existing backend is authoritative. The frontend must use only its verified upload, metadata, and paginated measurements endpoints. Supported uploads are KML and ZIP Shapefile archives. Measurements, CRS, properties, geometry, statuses, and errors come from FastAPI responses; the frontend must not invent progress, measurements, or records.

## Brand Commitments

The supplied brief requires a monochrome, editorial, precise, light interface inspired by the supplied Monopo Saigon design system: generous whitespace, thin borders, sharp content surfaces, pill controls, restrained motion, and no decorative color system.

## Evidence on Hand

The actual backend is present in `app/`. The frontend design brief is in the user-provided specification. No separate Monopo reference asset was found in the repository.

## Product Principles

- Trust the measurement source.
- Make processing state legible.
- Keep the workspace quiet and information-dense.
- Expose failure at feature level without hiding successful results.
- Preserve a fast path from upload to inspection.

## Accessibility & Inclusion

Use semantic HTML, keyboard-operable upload controls, visible focus, status announcements, readable contrast, responsive tables, and reduced-motion support.

