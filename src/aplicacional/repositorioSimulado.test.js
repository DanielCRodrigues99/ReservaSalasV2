import { testarContratoRepositorio } from "./contratoRepositorio";
import { criarRepositorioSimulado } from "./repositorioSimulado";

// Garante que a persistência simulada se comporta como um repositório verdadeiro.
testarContratoRepositorio("Repositório simulado", criarRepositorioSimulado);
