import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <>
      <Navbar 
        activeTab="esportes"
        isLoggedIn={false}
        onLogin={() => console.log('Login')}
        onRegister={() => console.log('Register')}
      />
      
      <main id="main-content" className="min-h-screen pt-[50px]">
        {/* Placeholder para conteúdo futuro */}
        <div className="max-w-[1232px] mx-auto px-sm py-bg">
          <section className="bg-brand-surface-card rounded-lg p-md text-center">
            <h1 className="heading-branded text-2xl text-brand-primary mb-sm">
              KTO BET
            </h1>
            <p className="text-gray-600">
              Componentes da homepage serão implementados aqui.
            </p>
            <div className="mt-md flex flex-wrap gap-sm justify-center">
              <span className="chip chip-top">Top</span>
              <button className="btn btn-primary">Registrar</button>
              <button className="btn btn-secondary">Ao Vivo</button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
