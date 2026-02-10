import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../plugins/auth.js';
import { env } from '../../config/env.js';

interface CnpjParams {
  cnpj: string;
}

interface CepParams {
  cep: string;
}

interface ReceitaWSResponse {
  status: string;
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  municipio: string;
  uf: string;
  email: string;
  telefone: string;
  situacao: string;
  message?: string;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default async function consultaRoutes(fastify: FastifyInstance) {
  // CNPJ lookup via ReceitaWS
  fastify.get(
    '/consultas/cnpj/:cnpj',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Consultas'],
        summary: 'Consultar CNPJ',
        description: 'Consulta dados de empresa pelo CNPJ via ReceitaWS',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['cnpj'],
          properties: {
            cnpj: { type: 'string', pattern: '^\\d{14}$' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              nome: { type: 'string' },
              fantasia: { type: 'string' },
              logradouro: { type: 'string' },
              numero: { type: 'string' },
              complemento: { type: 'string' },
              cep: { type: 'string' },
              bairro: { type: 'string' },
              municipio: { type: 'string' },
              uf: { type: 'string' },
              email: { type: 'string' },
              telefone: { type: 'string' },
              situacao: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          502: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { cnpj } = request.params as CnpjParams;

      if (!/^\d{14}$/.test(cnpj)) {
        return reply.status(400).send({
          code: 'INVALID_CNPJ',
          message: 'CNPJ deve conter exatamente 14 dígitos numéricos',
        });
      }

      try {
        const token = env.RECEITA_WS_TOKEN;
        const url = token
          ? `https://receitaws.com.br/v1/cnpj/${cnpj}?token=${token}`
          : `https://receitaws.com.br/v1/cnpj/${cnpj}`;

        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          return reply.status(502).send({
            code: 'EXTERNAL_API_ERROR',
            message: 'Erro ao consultar ReceitaWS',
          });
        }

        const data = (await response.json()) as ReceitaWSResponse;

        if (data.status === 'ERROR' || data.message) {
          return reply.status(404).send({
            code: 'CNPJ_NOT_FOUND',
            message: data.message || 'CNPJ não encontrado',
          });
        }

        return reply.send({
          nome: data.nome || '',
          fantasia: data.fantasia || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          cep: (data.cep || '').replace(/\D/g, ''),
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          email: data.email || '',
          telefone: data.telefone || '',
          situacao: data.situacao || '',
        });
      } catch (error) {
        request.log.error(error, 'Erro ao consultar CNPJ');
        return reply.status(502).send({
          code: 'EXTERNAL_API_ERROR',
          message: 'Erro ao consultar ReceitaWS',
        });
      }
    }
  );

  // CEP lookup via ViaCEP
  fastify.get(
    '/consultas/cep/:cep',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Consultas'],
        summary: 'Consultar CEP',
        description: 'Consulta endereço pelo CEP via ViaCEP',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['cep'],
          properties: {
            cep: { type: 'string', pattern: '^\\d{8}$' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              cep: { type: 'string' },
              logradouro: { type: 'string' },
              complemento: { type: 'string' },
              bairro: { type: 'string' },
              localidade: { type: 'string' },
              uf: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          502: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { cep } = request.params as CepParams;

      if (!/^\d{8}$/.test(cep)) {
        return reply.status(400).send({
          code: 'INVALID_CEP',
          message: 'CEP deve conter exatamente 8 dígitos numéricos',
        });
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!response.ok) {
          return reply.status(502).send({
            code: 'EXTERNAL_API_ERROR',
            message: 'Erro ao consultar ViaCEP',
          });
        }

        const data = (await response.json()) as ViaCEPResponse;

        if (data.erro) {
          return reply.status(404).send({
            code: 'CEP_NOT_FOUND',
            message: 'CEP não encontrado',
          });
        }

        return reply.send({
          cep: (data.cep || '').replace(/\D/g, ''),
          logradouro: data.logradouro || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || '',
        });
      } catch (error) {
        request.log.error(error, 'Erro ao consultar CEP');
        return reply.status(502).send({
          code: 'EXTERNAL_API_ERROR',
          message: 'Erro ao consultar ViaCEP',
        });
      }
    }
  );
}
