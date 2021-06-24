import PageFormat from '../../components/PageFormat/PageFormat';

function HomePage() {
  return (
    <PageFormat pageTitle={'Home'}>
      <div className="home-page-container" data-testid="home-page">
        <h3>Welcome to TRON Common API Dashboard</h3>
        <p>The purpose of the Dashboard is to provide information and management tools for TRON Common API.</p>
        <p>The TRON Common API Swagger documentation is available <a href="/api/api-docs/index">here.</a></p>
      </div>
    </PageFormat>
  );
}

export default HomePage;