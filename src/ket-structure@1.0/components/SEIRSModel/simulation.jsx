
export const simulateParametersSEIRS = (T, params, optionalParams) => {
  let {b =1.9 / 100, d =0.8 / 100, nu = 0.8, rho =1 / 2, alpha =1 / 14, _beta = 4, beta =1 / 4, sigma =1 / 3, gamma =1 / 7, _S0 = .9, _I0 = .1, _E0 = 0, _R0 = 0, S0 = .25, I0 = .25, E0 = .25, R0 = .25, Nfactor=1} = (params || {});
  let {epsilon_t = 1e-2, epsilon_n = 100} = (optionalParams || {});

  const dt = epsilon_t;
  const deltan = epsilon_n;

  b = b / 365; // Adjusted by year
  d = d / 365; // Adjusted by year
  //const beta = tau * c;
  S0 *= Nfactor;
  E0 *= Nfactor;
  I0 *= Nfactor;
  R0 *= Nfactor;
  let N0 = (S0 + I0 + E0 + R0);
  let dS,
    dE,
    dI,
    dR,
    dN;
  let S = S0,
    E = E0,
    I = I0,
    R = R0,
    N = N0;
  //"color": "hsl(269, 70%, 50%)",
  let output = [
    {
      "id": "R",
      "data": [],
    },
    {
      "id": "I",
      "data": [],
    },
    {
      "id": "E",
      "data": [],
    },
    {
      "id": "S",
      "data": [],
    },
  ///{ "id": "N", "data": [], },
  ];
  const indices = {
    S: 3,
    I: 1,
    E: 2,
    R: 0
  };
  //
  output[indices.S].data.push({
    x: 0,
    y: S
  })
  output[indices.E].data.push({
    x: 0,
    y: E
  })
  output[indices.I].data.push({
    x: 0,
    y: I
  })
  output[indices.R].data.push({
    x: 0,
    y: R
  })
  ///output[4].data.push({x: 0, y: N})
  //
  for (let i = 1; i < T; i++) {
    dS = b * (1 - nu) * N - beta * S * I / N - d * S + alpha * R - rho * S;
    dE = beta * S * I / N - sigma * E - d * E;
    dI = sigma * E - gamma * I - d * I;
    dR = b * nu * N + gamma * I - d * R - alpha * R + rho * S;
    dN = (b - d) * N;
    S += dS * dt;
    E += dE * dt;
    I += dI * dt;
    R += dR * dt;
    N += dN * dt;
    if (i % deltan == 0) {
      output[indices.S].data.push({
        x: dt * i,
        y: S
      })
      output[indices.E].data.push({
        x: dt * i,
        y: E
      })
      output[indices.I].data.push({
        x: dt * i,
        y: I
      })
      output[indices.R].data.push({
        x: dt * i,
        y: R
      })
    ///output[4].data.push({x: dt * i, y: N})
    }
  }
  console.log("N:", N, "  N0:", N0);
  return output;
}
