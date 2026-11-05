import ListaSalas from "../components/ListaSalas";

// Dados de exemplo: vão ser substituídos pelo caso de uso de listagem de salas.
const SALAS_EXEMPLO = [
  { id: 1, nome: "Sala Atlântico", capacidade: 12 },
  { id: 2, nome: "Sala Douro", capacidade: 6 },
  { id: 3, nome: "Sala Tejo", capacidade: 20 },
  { id: 4, nome: "Sala Mondego", capacidade: 4 },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Salas</h1>
      <ListaSalas salas={SALAS_EXEMPLO} />
    </main>
  );
}
