"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      setUsuarioLogado(JSON.parse(usuarioString));
    }
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center flex-grow py-20 px-4 text-center">
        <div className="mb-6 drop-shadow-[0_0_25px_rgba(228,183,125,0.15)]">
           <Image 
            src="/logoSemFundo.png" 
            alt="Victor Uematsu Barbearia Desde 2016" 
            width={300} 
            height={300} 
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          O seu estilo, <br className="hidden md:block" />
          <span className="text-[#E4B77D]">em boas mãos.</span>
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-8">
          Agende seu corte, barba ou tratamento na melhor barbearia da cidade. Profissionais qualificados e um ambiente preparado para você.
        </p>
        <Link 
          href={usuarioLogado ? "/agendamento" : "/login"} 
          className="px-8 py-3 text-lg font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-transform hover:scale-105 shadow-lg shadow-[#E4B77D]/10"
        >
          Agendar Meu Horário
        </Link>
      </main>

      {/* SEÇÃO: COMO CHEGAR (MAPA) */}
      <section id="como-chegar" className="w-full bg-zinc-950 border-t border-zinc-900 py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Informações de Contato à Esquerda */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Como <span className="text-[#E4B77D]">Chegar</span></h2>
            <p className="text-zinc-400 mb-8 text-lg">
              Estamos localizados em um ponto de fácil acesso na Vila Maristela.
            </p>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-[#E4B77D] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Endereço</h3>
                  <p className="text-zinc-400">R. Cel. Albino, 22 - Vila Maristela<br/>Pres. Prudente - SP, 19020-360</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-[#E4B77D] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Telefone / WhatsApp</h3>
                  <p className="text-zinc-400">+55 (18) 98194-7357</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mapa à Direita */}
          <div className="flex-1 w-full bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3696.085816480521!2d-51.39343362375836!3d-22.122619179815042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9493f44e5bc111e1%3A0x6b1cc46162ab8f90!2sR.%20Cel.%20Albino%2C%2022%20-%20Vila%20Maristela%2C%20Pres.%20Prudente%20-%20SP%2C%2019020-360!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="350" 
              style={{ border: 0, borderRadius: '0.75rem' }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}