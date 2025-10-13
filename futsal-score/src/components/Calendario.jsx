import React from "react";
import '../index.css' 

export default function Calendario() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow fade-in-up">
      <h2 className="text-xl font-semibold mb-4">Calendário de Jogos</h2>
      <p className="text-gray-600">
        Aqui será exibido o calendário de jogos da equipe, com datas e horários
        dos confrontos.
      </p>
    </div>
  );
}
