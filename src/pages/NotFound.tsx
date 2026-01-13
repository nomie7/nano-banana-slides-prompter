import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t('notFound.message', 'Page not found')}
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t('notFound.returnHome', 'Return to home')}
        </a>
      </div>
    </div>
  );
}
