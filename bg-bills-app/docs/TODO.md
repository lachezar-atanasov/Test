# TODO & Future Enhancements

## Completed ✅

- [x] Project initialization with Expo and TypeScript
- [x] ESLint and Prettier configuration
- [x] Supabase setup and database schema
- [x] Authentication flow (login, register, forgot password)
- [x] Onboarding screen
- [x] Dashboard with upcoming bills and summary
- [x] Bills list and management
- [x] Calendar view
- [x] Reports/analytics screen
- [x] Settings screen
- [x] Recurrence logic and bill generation
- [x] Analytics aggregation
- [x] Push notifications setup
- [x] Bulgarian language localization
- [x] Unit tests for domain logic

## In Progress / Next Steps

### High Priority

1. **Fix Test Configuration**
   - Resolve Jest/Expo module resolution issues
   - Ensure all domain tests run successfully

2. **Bill Detail Screen**
   - Create detail view for individual bills
   - Allow marking as paid/unpaid
   - Show payment history

3. **Edit Bill Functionality**
   - Allow editing recurring bills
   - Update generated payment instances

4. **Notification Scheduling**
   - Integrate notification scheduling when bills are created
   - Schedule reminders based on user settings
   - Handle notification cancellation when bills are paid

### Medium Priority

5. **Data Export**
   - Implement CSV export functionality
   - Add PDF report generation

6. **Bill Attachments**
   - Photo capture for bills
   - PDF upload support
   - Storage in Supabase Storage

7. **Search Functionality**
   - Search bills by title, provider, category
   - Filter by date range

8. **Recurring Bill Templates**
   - Pre-configured common bills (ток, вода, etc.)
   - Quick add from templates

### Low Priority / Future

9. **Multi-currency Support**
   - Support EUR, USD, etc.
   - Currency conversion

10. **Budgeting Features**
    - Set monthly budgets per category
    - Budget vs actual tracking
    - Alerts when approaching budget limits

11. **Dark Mode**
    - Theme switching
    - System theme detection

12. **Backend Scheduling**
    - Move notification scheduling to Supabase Edge Functions
    - Scheduled job to generate monthly bill instances
    - Automated reminder sending

13. **Advanced Analytics**
    - Year-over-year comparisons
    - Spending trends
    - Category spending forecasts

14. **Social Features** (Optional)
    - Share bills with family members
    - Multi-user household support

15. **Offline Support**
    - Cache bills locally
    - Sync when online

## Technical Debt

- [ ] Improve error handling across all screens
- [ ] Add loading skeletons instead of spinners
- [ ] Optimize image loading and caching
- [ ] Add pagination for large bill lists
- [ ] Implement proper form validation
- [ ] Add accessibility labels
- [ ] Improve TypeScript strictness
- [ ] Add E2E tests with Detox or similar

## Known Issues

- Test configuration needs adjustment for Expo modules
- Some screens may need better empty states
- Calendar view could be more polished
- Reports screen could use charts/visualizations
