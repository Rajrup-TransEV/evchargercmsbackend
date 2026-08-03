# Legacy CMS documentation

Current focused contracts and operational notes:

- [App-user money transaction history](app-user-money-transaction-history.md)
- [Frontend charging-session API](frontend-charging-session-api.md)
- [Charging transaction core rollout](transaction-core-rollout.md)
- [Development plan](DEVELOPMENT_PLAN.md)
- [Current project state](PROJECT_STATE.md)
- [AI-assisted changelog](AI_CHANGELOG.md)

Interactive API documentation is served from `/swagger`, with the raw schema
at `/openapi.json`, when `API_DOCS_ENABLED` is enabled. The current OpenAPI
inventory is incomplete outside the explicitly documented routes; do not infer
that an undocumented legacy route is safe or supported merely because it is
present in source code.
