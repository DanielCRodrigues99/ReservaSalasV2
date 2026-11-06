export class ErroValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "ErroValidacao";
  }
}

export class ErroSobreposicao extends Error {
  constructor(reservaEmConflito) {
    super("A sala já tem uma reserva nesse horário.");
    this.name = "ErroSobreposicao";
    this.reservaEmConflito = reservaEmConflito;
  }
}
