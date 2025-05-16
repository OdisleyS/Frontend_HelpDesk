'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, FormField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

interface Categoria {
  id: number;
  nome: string;
}

type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA';
const prioridades: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA'];

interface SlaMap {
  [categoriaId: number]: {
    [prioridade in Prioridade]: string;
  };
}

export default function GestorSlaPage() {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [sla, setSla] = useState<SlaMap>({});
  const [valorGlobal, setValorGlobal] = useState<Record<Prioridade, string>>({
    BAIXA: '',
    MEDIA: '',
    ALTA: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (!token) return;

        const [categoriasData, slasSalvos] = await Promise.all([
          api.categories.list(token),
          api.sla.listAll(token),
        ]);

        setCategorias(categoriasData);

        const inicial: SlaMap = {};
        categoriasData.forEach((cat: Categoria) => {
          inicial[cat.id] = { BAIXA: '', MEDIA: '', ALTA: '' };
        });

        slasSalvos.forEach((slaItem: any) => {
          if (inicial[slaItem.categoriaId]) {
            inicial[slaItem.categoriaId][slaItem.prioridade as Prioridade] =
              slaItem.minutosResolucao.toString();
          }
        });

        setSla(inicial);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, [token]);

  const atualizarSla = (catId: number, prioridade: Prioridade, valor: string) => {
    setSla((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [prioridade]: valor,
      },
    }));
  };

  const aplicarGlobal = () => {
    setSla((prev) => {
      const novo = { ...prev };
      for (const catId in novo) {
        prioridades.forEach((p) => {
          if (valorGlobal[p]) {
            novo[Number(catId)][p] = valorGlobal[p];
          }
        });
      }
      return { ...novo };
    });
  };

  const salvarSla = async () => {
    setLoading(true);
    try {
      if (!token) return;

      const slas: {
        categoriaId: number;
        prioridade: Prioridade;
        minutosResolucao: number;
      }[] = [];

      for (const catId in sla) {
        for (const prioridade of prioridades) {
          const minutos = Number(sla[catId][prioridade]);
          if (!isNaN(minutos) && minutos > 0) {
            slas.push({
              categoriaId: Number(catId),
              prioridade,
              minutosResolucao: minutos,
            });
          }
        }
      }

      await api.sla.batchSave(slas, token);
      alert('SLAs salvos com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar SLAs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de SLA por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-bold">Definir tempo padrão para todas as categorias</h2>
          <div className="grid grid-cols-3 gap-4">
            {prioridades.map((p) => (
              <FormField key={p} id={`global-${p}`} label={`Prioridade ${p}`}>
                <Input
                  type="number"
                  value={valorGlobal[p]}
                  onChange={(e) =>
                    setValorGlobal((prev) => ({ ...prev, [p]: e.target.value }))
                  }
                />
              </FormField>
            ))}
          </div>
          <Button onClick={aplicarGlobal}>Aplicar para todos</Button>
        </CardContent>
      </Card>

      {categorias.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle>{cat.nome}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {prioridades.map((p) => (
              <FormField key={p} id={`${cat.id}-${p}`} label={`Prioridade ${p}`}>
                <Input
                  type="number"
                  value={sla[cat.id]?.[p] || ''}
                  onChange={(e) => atualizarSla(cat.id, p, e.target.value)}
                />
              </FormField>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={salvarSla} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar SLA'}
        </Button>
      </div>
    </div>
  );
}
