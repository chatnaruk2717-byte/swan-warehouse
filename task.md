- [x] Change default theme state to light mode in `ThemeContext.tsx`.
- [x] Remove hardcoded `dark` className from layout html wrapper in `layout.tsx`.
- [x] Adjust card background opacity, border, and shadows in `globals.css` for clean light theme look.
- [x] Update dashboard greetings banners and stat cards to match the light theme screenshot (including trend metrics and badges).
- [x] Fix document disappearance on refresh by modifying `file_url` in `documents` to `LONGTEXT` (including the early-return table checks block).
- [x] Modify `proof_file` in `daily_tasks` to `LONGTEXT` to support large PDF submissions.
- [x] Implement automatic copying of task proof files into the `documents` table under the correct category (e.g. Kaizen, OPL) when supervisor approves the task.
- [x] Fix PDF preview modal iframe blank screen blocking issue by converting Base64 strings to Blob Object URLs.
- [x] Fix org chart edit/update failure by modifying `image_url` in `org_chart` to `LONGTEXT`.
- [x] Add drag-and-drop support to org chart for interactive rearrangement of nodes (level changes and horizontal reordering).
- [x] Compile, build, deploy, and verify everything works.
- [x] Create missing `performance_settings` database table in production during startup checks to fix empty Employee Performance page.
- [x] Render learning progress list dynamically in the employee dashboard from the database.
- [x] Automatically create course enrollment row when a user completes a lesson or submits a quiz, to correctly calculate completed course statistics.
- [x] Fix course self-enrollment permission on backend API to allow employee role (with self ID security checks), so course learners show up correctly.
- [x] Implement month deletion feature on the department KPIs dashboard and persist the states in localStorage.




