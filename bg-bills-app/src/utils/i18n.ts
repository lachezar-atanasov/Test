// Simple i18n structure - currently only Bulgarian, but ready for expansion
type TranslationKey =
  | 'app.name'
  | 'auth.login'
  | 'auth.register'
  | 'auth.forgotPassword'
  | 'auth.email'
  | 'auth.password'
  | 'auth.confirmPassword'
  | 'auth.loginButton'
  | 'auth.registerButton'
  | 'auth.logout'
  | 'auth.resetPassword'
  | 'onboarding.welcome'
  | 'onboarding.language'
  | 'onboarding.payday'
  | 'onboarding.reminderDays'
  | 'onboarding.continue'
  | 'dashboard.title'
  | 'dashboard.upcoming'
  | 'dashboard.overdue'
  | 'dashboard.thisMonth'
  | 'dashboard.paid'
  | 'dashboard.remaining'
  | 'bills.title'
  | 'bills.all'
  | 'bills.upcoming'
  | 'bills.paid'
  | 'bills.overdue'
  | 'bills.add'
  | 'bills.edit'
  | 'bills.delete'
  | 'bills.markPaid'
  | 'bills.markUnpaid'
  | 'bills.dueDate'
  | 'bills.amount'
  | 'bills.category'
  | 'bills.provider'
  | 'bills.recurrence'
  | 'bills.notes'
  | 'bills.expectedAmount'
  | 'bills.oneOff'
  | 'calendar.title'
  | 'reports.title'
  | 'reports.thisMonth'
  | 'reports.lastMonth'
  | 'reports.customRange'
  | 'reports.total'
  | 'reports.byCategory'
  | 'reports.byProvider'
  | 'reports.export'
  | 'settings.title'
  | 'settings.profile'
  | 'settings.notifications'
  | 'settings.data'
  | 'settings.exportData'
  | 'settings.deleteAccount'
  | 'settings.language'
  | 'settings.payday'
  | 'settings.defaultReminderDays'
  | 'settings.quietHours'
  | 'settings.enablePush'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.search'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.confirm'
  | 'common.yes'
  | 'common.no'
  | 'empty.bills'
  | 'empty.categories'
  | 'empty.payments'
  | 'categories.electricity'
  | 'categories.heating'
  | 'categories.water'
  | 'categories.internet'
  | 'categories.phone'
  | 'categories.rent'
  | 'categories.subscriptions'
  | 'categories.taxes'
  | 'categories.other';

const translations: Record<TranslationKey, string> = {
  'app.name': 'BG Bills',
  'auth.login': 'Вход',
  'auth.register': 'Регистрация',
  'auth.forgotPassword': 'Забравена парола',
  'auth.email': 'Имейл',
  'auth.password': 'Парола',
  'auth.confirmPassword': 'Потвърди парола',
  'auth.loginButton': 'Влез',
  'auth.registerButton': 'Регистрирай се',
  'auth.logout': 'Изход',
  'auth.resetPassword': 'Изпрати линк за възстановяване',
  'onboarding.welcome': 'Добре дошли в BG Bills',
  'onboarding.language': 'Език',
  'onboarding.payday': 'На коя дата получавате заплата?',
  'onboarding.reminderDays': 'Дни преди падеж за напомняне',
  'onboarding.continue': 'Продължи',
  'dashboard.title': 'Табло',
  'dashboard.upcoming': 'Предстоящи плащания',
  'dashboard.overdue': 'Просрочени',
  'dashboard.thisMonth': 'Този месец: общо',
  'dashboard.paid': 'Платено',
  'dashboard.remaining': 'Остава',
  'bills.title': 'Всички сметки',
  'bills.all': 'Всички',
  'bills.upcoming': 'Само предстоящи',
  'bills.paid': 'Платени',
  'bills.overdue': 'Просрочени',
  'bills.add': 'Добави сметка',
  'bills.edit': 'Редактирай',
  'bills.delete': 'Изтрий',
  'bills.markPaid': 'Маркирай като платено',
  'bills.markUnpaid': 'Маркирай като неплатено',
  'bills.dueDate': 'Дата на падеж',
  'bills.amount': 'Размер',
  'bills.category': 'Категория',
  'bills.provider': 'Доставчик',
  'bills.recurrence': 'Повторение',
  'bills.notes': 'Бележки',
  'bills.expectedAmount': 'Очаквана сума',
  'bills.oneOff': 'Еднократна сметка',
  'calendar.title': 'Календар',
  'reports.title': 'Месечен отчет',
  'reports.thisMonth': 'Този месец',
  'reports.lastMonth': 'Миналия месец',
  'reports.customRange': 'Персонализиран период',
  'reports.total': 'Общо',
  'reports.byCategory': 'По категория',
  'reports.byProvider': 'По доставчик',
  'reports.export': 'Експорт на данни (CSV)',
  'settings.title': 'Настройки',
  'settings.profile': 'Профил',
  'settings.notifications': 'Известия',
  'settings.data': 'Данни',
  'settings.exportData': 'Експорт на данни (CSV)',
  'settings.deleteAccount': 'Изтриване на акаунта',
  'settings.language': 'Език',
  'settings.payday': 'Дата на заплата',
  'settings.defaultReminderDays': 'Дни преди падеж за напомняне',
  'settings.quietHours': 'Тихи часове',
  'settings.enablePush': 'Разреши push известия',
  'common.save': 'Запази',
  'common.cancel': 'Отказ',
  'common.delete': 'Изтрий',
  'common.edit': 'Редактирай',
  'common.search': 'Търсене',
  'common.loading': 'Зареждане...',
  'common.error': 'Грешка',
  'common.retry': 'Опитай отново',
  'common.confirm': 'Потвърди',
  'common.yes': 'Да',
  'common.no': 'Не',
  'empty.bills': 'Все още нямаш добавени сметки. Натисни "+" за да добавиш първата си сметка.',
  'empty.categories': 'Няма категории',
  'empty.payments': 'Няма плащания за този период',
  'categories.electricity': 'Ток',
  'categories.heating': 'Парно',
  'categories.water': 'Вода',
  'categories.internet': 'Интернет',
  'categories.phone': 'Телефон',
  'categories.rent': 'Наем',
  'categories.subscriptions': 'Абонаменти',
  'categories.taxes': 'Данъци',
  'categories.other': 'Други',
};

export const t = (key: TranslationKey): string => {
  return translations[key] || key;
};

export type { TranslationKey };
