import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
}

interface Tienda {
  id: string;
  nombre: string;
  tendero: string;
  ciudad: string;
  productosCount: number;
  inventario: Producto[];
}

const CATEGORIAS_TIENDA = [
  'Abarrotes',
  'Mascotas',
  'Lácteos',
  'Bebidas',
  'Panadería',
  'Snacks y Pasabocas',
  'Aseo del Hogar',
  'Aseo Personal',
  'Carnes y Charcutería',
  'Dulcería y Confitería',
  'Licores y Cigarrillos',
  'Otros'
];

export const MasterDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [tiendas, setTiendas] = useState<Tienda[]>([
    {
      id: '1',
      nombre: 'Abarrotes Doña María',
      tendero: 'María Gómez',
      ciudad: 'Popayán',
      productosCount: 3,
      inventario: [
        { id: 'P-001', nombre: 'Arroz Roa 1kg', precio: 4500, stock: 24, categoria: 'Abarrotes', activo: true },
        { id: 'P-002', nombre: 'Aceite Oleocali 1000ml', precio: 12500, stock: 10, categoria: 'Abarrotes', activo: true },
        { id: 'P-003', nombre: 'Leche Alquería 1L', precio: 4200, stock: 18, categoria: 'Lácteos', activo: true },
      ]
    },
    {
      id: '2',
      nombre: 'Minimarket Don José',
      tendero: 'José Rodríguez',
      ciudad: 'Popayán',
      productosCount: 3,
      inventario: [
        { id: 'P-101', nombre: 'Pan Tajado Bimbo', precio: 6500, stock: 8, categoria: 'Panadería', activo: true },
        { id: 'P-102', nombre: 'Whiskas Gatitos 500g', precio: 14000, stock: 15, categoria: 'Mascotas', activo: true },
        { id: 'P-103', nombre: 'Vino moscatel', precio: 30000, stock: 100, categoria: 'Bebidas', activo: true },
      ]
    },
    {
      id: '3',
      nombre: 'Tienda La Esquina',
      tendero: 'Carlos López',
      ciudad: 'Cali',
      productosCount: 2,
      inventario: [
        { id: 'P-201', nombre: 'Gaseosa Coca-Cola 1.5L', precio: 5500, stock: 30, categoria: 'Bebidas', activo: true },
        { id: 'P-202', nombre: 'Papas Margarita Pollazo', precio: 2500, stock: 40, categoria: 'Snacks y Pasabocas', activo: true },
      ]
    },
  ]);

  const [tiendaActiva, setTiendaActiva] = useState<Tienda | null>(null);

  // Formulario individual
  const [nuevoId, setNuevoId] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Abarrotes');

  // Buscador y Edición
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editCategoria, setEditCategoria] = useState('Abarrotes');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agregar Producto Individual
  const handleAgregarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiendaActiva || !nuevoId || !nuevoNombre || !nuevoPrecio || !nuevoStock) return;

    const idLimpio = nuevoId.trim().toUpperCase();

    const existeId = tiendaActiva.inventario.some(p => p.id === idLimpio);
    if (existeId) {
      alert(`⚠️ El ID "${idLimpio}" ya existe en esta tienda. Usa un ID único.`);
      return;
    }

    const productoCreado: Producto = {
      id: idLimpio,
      nombre: nuevoNombre.trim(),
      precio: parseFloat(nuevoPrecio),
      stock: parseInt(nuevoStock, 10),
      categoria: nuevaCategoria,
      activo: true
    };

    setTiendas(prevTiendas => 
      prevTiendas.map(t => {
        if (t.id === tiendaActiva.id) {
          const nuevoInv = [...t.inventario, productoCreado];
          const tiendaActualizada = { ...t, inventario: nuevoInv, productosCount: nuevoInv.length };
          setTiendaActiva(tiendaActualizada);
          return tiendaActualizada;
        }
        return t;
      })
    );

    setNuevoId('');
    setNuevoNombre('');
    setNuevoPrecio('');
    setNuevoStock('');
  };

  // EXPORTAR INVENTARIO A EXCEL CON ESTADO
  const handleExportarExcel = () => {
    if (!tiendaActiva || tiendaActiva.inventario.length === 0) {
      alert('⚠️ No hay productos para exportar en esta tienda.');
      return;
    }

    const datosExportar = tiendaActiva.inventario.map(p => ({
      'ID Producto': p.id,
      'Nombre': p.nombre,
      'Precio ($)': p.precio,
      'Stock': p.stock,
      'Categoría': p.categoria,
      'Estado': p.activo ? 'ACTIVO' : 'INACTIVO'
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    const nombreArchivo = `Inventario_${tiendaActiva.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  };

  // IMPORTACIÓN INTELIGENTE CON ACTUALIZACIÓN AUTOMÁTICA (UPSERT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tiendaActiva) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length === 0) {
          alert('⚠️ El archivo está vacío.');
          return;
        }

        let creadosCount = 0;
        let actualizadosCount = 0;

        // Copiamos el inventario actual para manipularlo
        let inventarioActualizado = [...tiendaActiva.inventario];

        for (let i = 0; i < jsonRows.length; i++) {
          const fila = jsonRows[i];
          if (!fila || fila.length === 0) continue;

          const col0 = String(fila[0] ?? '').trim();
          if (i === 0 && (col0.toLowerCase().includes('id') || col0.toLowerCase().includes('codigo') || col0.toLowerCase().includes('producto'))) {
            continue;
          }

          if (fila.length < 4) continue;

          const rawId = String(fila[0] ?? '').trim();
          const rawNombre = String(fila[1] ?? '').trim();
          const rawPrecio = String(fila[2] ?? '').trim();
          const rawStock = String(fila[3] ?? '').trim();
          const rawCategoria = fila[4] ? String(fila[4]).trim() : 'Abarrotes';
          const rawEstado = fila[5] ? String(fila[5]).trim().toUpperCase() : 'ACTIVO';

          const idLimpio = rawId.toUpperCase();

          if (!idLimpio || !rawNombre || !rawPrecio || !rawStock) continue;

          const precio = parseFloat(rawPrecio);
          const stock = parseInt(rawStock, 10);

          if (isNaN(precio) || isNaN(stock)) continue;

          // Determinar estado booleano
          const esActivo = rawEstado !== 'INACTIVO' && rawEstado !== 'FALSE' && rawEstado !== '0';

          const indiceExistente = inventarioActualizado.findIndex(p => p.id === idLimpio);

          if (indiceExistente !== -1) {
            // SI EXISTE: Actualiza los campos (Nombre, Precio, Stock, Categoria y Estado)
            inventarioActualizado[indiceExistente] = {
              ...inventarioActualizado[indiceExistente],
              nombre: rawNombre,
              precio,
              stock,
              categoria: rawCategoria || inventarioActualizado[indiceExistente].categoria,
              activo: esActivo
            };
            actualizadosCount++;
          } else {
            // SI NO EXISTE: Lo crea como nuevo producto
            inventarioActualizado.push({
              id: idLimpio,
              nombre: rawNombre,
              precio,
              stock,
              categoria: rawCategoria || 'Abarrotes',
              activo: esActivo
            });
            creadosCount++;
          }
        }

        if (creadosCount === 0 && actualizadosCount === 0) {
          alert('⚠️ No se procesaron cambios válidos desde el archivo.');
          return;
        }

        setTiendas(prevTiendas =>
          prevTiendas.map(t => {
            if (t.id === tiendaActiva.id) {
              const tiendaActualizada = {
                ...t,
                inventario: inventarioActualizado,
                productosCount: inventarioActualizado.length
              };
              setTiendaActiva(tiendaActualizada);
              return tiendaActualizada;
            }
            return t;
          })
        );

        alert(`✅ ¡Proceso finalizado con éxito!\n\n🆕 Productos nuevos creados: ${creadosCount}\n🔄 Productos existentes actualizados (Precios/Stock/Estado): ${actualizadosCount}`);

      } catch (error) {
        alert('❌ Error al procesar el archivo. Verifica el formato del Excel/CSV.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Activar / Inactivar
  const handleToggleActivo = (productoId: string) => {
    if (!tiendaActiva) return;

    setTiendas(prevTiendas =>
      prevTiendas.map(t => {
        if (t.id === tiendaActiva.id) {
          const nuevoInv = t.inventario.map(p => {
            if (p.id === productoId) {
              return { ...p, activo: !p.activo };
            }
            return p;
          });
          const tiendaActualizada = { ...t, inventario: nuevoInv };
          setTiendaActiva(tiendaActualizada);
          return tiendaActualizada;
        }
        return t;
      })
    );
  };

  // Eliminar
  const handleEliminarProducto = (productoId: string, nombreProd: string) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar el producto "${nombreProd}" (ID: ${productoId})?`);
    if (!confirmar || !tiendaActiva) return;

    setTiendas(prevTiendas =>
      prevTiendas.map(t => {
        if (t.id === tiendaActiva.id) {
          const nuevoInv = t.inventario.filter(p => p.id !== productoId);
          const tiendaActualizada = { ...t, inventario: nuevoInv, productosCount: nuevoInv.length };
          setTiendaActiva(tiendaActualizada);
          return tiendaActualizada;
        }
        return t;
      })
    );
  };

  // Edición
  const iniciarEdicion = (prod: Producto) => {
    setEditandoId(prod.id);
    setEditNombre(prod.nombre);
    setEditPrecio(prod.precio);
    setEditStock(prod.stock);
    setEditCategoria(prod.categoria);
  };

  const guardarEdicion = (productoId: string) => {
    if (!tiendaActiva) return;

    setTiendas(prevTiendas =>
      prevTiendas.map(t => {
        if (t.id === tiendaActiva.id) {
          const nuevoInv = t.inventario.map(p => {
            if (p.id === productoId) {
              return { 
                ...p, 
                nombre: editNombre.trim(), 
                precio: Number(editPrecio), 
                stock: Number(editStock),
                categoria: editCategoria
              };
            }
            return p;
          });
          const tiendaActualizada = { ...t, inventario: nuevoInv };
          setTiendaActiva(tiendaActualizada);
          return tiendaActualizada;
        }
        return t;
      })
    );
    setEditandoId(null);
  };

  const inventarioFiltrado = tiendaActiva ? tiendaActiva.inventario.filter(p => 
    p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    p.id.toLowerCase().includes(filtroBusqueda.toLowerCase())
  ) : [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Encabezado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', color: '#fff', padding: '15px 25px', borderRadius: '8px' }}>
        <div>
          <h2 style={{ margin: 0 }}>TiendaControl — Panel Maestro</h2>
          <small style={{ color: '#94a3b8' }}>Modo SuperAdmin: Asistencia Remota y Gestión Global</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontSize: '14px', color: '#ffffff' }}>Tienda en Asistencia:</label>
          <select 
            value={tiendaActiva?.id || ''} 
            onChange={(e) => {
              const selected = tiendas.find(t => t.id === e.target.value);
              setTiendaActiva(selected || null);
              setFiltroBusqueda('');
              setEditandoId(null);
            }}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#000', backgroundColor: '#fff', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="">-- Vista Global (Todas) --</option>
            {tiendas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} ({t.tendero})</option>
            ))}
          </select>

          <button 
            onClick={onLogout} 
            style={{ marginLeft: '15px', padding: '8px 15px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {tiendaActiva ? (
        <div style={{ marginTop: '20px' }}>
          {/* Banner Control */}
          <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>📡 Modo Control Remoto: {tiendaActiva.nombre}</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                Asistiendo a <strong>{tiendaActiva.tendero}</strong> | Ubicación: <strong>{tiendaActiva.ciudad}</strong>
              </p>
            </div>
            <button 
              onClick={() => { setTiendaActiva(null); setEditandoId(null); }}
              style={{ padding: '8px 15px', backgroundColor: '#fff', color: '#2563eb', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ⬅️ Volver a Lista Global
            </button>
          </div>

          {/* Formulario Individual */}
          <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ marginTop: 0, color: '#1e293b' }}>➕ Registrar Producto con ID Único</h4>
            <form onSubmit={handleAgregarProducto} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>ID del Producto</label>
                <input 
                  type="text" 
                  placeholder="Ej: P-045"
                  value={nuevoId}
                  onChange={(e) => setNuevoId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Nombre</label>
                <input 
                  type="text" 
                  placeholder="Ej: Atún Van Camp's 160g"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Precio ($)</label>
                <input 
                  type="number" 
                  placeholder="5500"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Stock Inicial</label>
                <input 
                  type="number" 
                  placeholder="12"
                  value={nuevoStock}
                  onChange={(e) => setNuevoStock(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Categoría</label>
                <select 
                  value={nuevaCategoria} 
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  {CATEGORIAS_TIENDA.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                style={{ padding: '9px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Guardar
              </button>
            </form>
          </div>

          {/* Inventario con Upsert Inteligente */}
          <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0, color: '#1e293b' }}>📦 Inventario de {tiendaActiva.nombre}</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="text"
                  placeholder="🔍 Buscar por ID o Nombre..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #cbd5e1', width: '220px' }}
                />

                <button 
                  onClick={handleExportarExcel}
                  style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  title="Descarga el inventario actual de la tienda en formato Excel"
                >
                  📥 Exportar Excel
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: 'none' }} 
                />

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '8px 14px', backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  title="Sube tu archivo Excel (.xlsx/.xls) o CSV para actualizar o crear productos"
                >
                  📊 Importar / Actualizar Excel
                </button>
              </div>
            </div>

            {inventarioFiltrado.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No se encontraron productos con ese criterio de búsqueda.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Producto</th>
                    <th style={{ padding: '10px' }}>Categoría</th>
                    <th style={{ padding: '10px' }}>Precio</th>
                    <th style={{ padding: '10px' }}>Stock</th>
                    <th style={{ padding: '10px' }}>Estado</th>
                    <th style={{ padding: '10px' }}>Acciones de Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((prod) => {
                    const estaEditando = editandoId === prod.id;
                    return (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: prod.activo ? 1 : 0.5, backgroundColor: prod.activo ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb' }}>{prod.id}</td>
                        
                        <td style={{ padding: '10px' }}>
                          {estaEditando ? (
                            <input 
                              type="text" 
                              value={editNombre} 
                              onChange={(e) => setEditNombre(e.target.value)}
                              style={{ padding: '4px', width: '90%' }}
                            />
                          ) : (
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{prod.nombre}</span>
                          )}
                        </td>

                        <td style={{ padding: '10px', color: '#475569' }}>
                          {estaEditando ? (
                            <select 
                              value={editCategoria} 
                              onChange={(e) => setEditCategoria(e.target.value)}
                              style={{ padding: '4px' }}
                            >
                              {CATEGORIAS_TIENDA.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          ) : (
                            prod.categoria
                          )}
                        </td>

                        <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>
                          {estaEditando ? (
                            <input 
                              type="number" 
                              value={editPrecio} 
                              onChange={(e) => setEditPrecio(Number(e.target.value))}
                              style={{ padding: '4px', width: '80px' }}
                            />
                          ) : (
                            `$${prod.precio.toLocaleString()}`
                          )}
                        </td>

                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          {estaEditando ? (
                            <input 
                              type="number" 
                              value={editStock} 
                              onChange={(e) => setEditStock(Number(e.target.value))}
                              style={{ padding: '4px', width: '60px' }}
                            />
                          ) : (
                            <span style={{ color: prod.stock <= 5 ? '#dc2626' : '#0f172a' }}>{prod.stock} un.</span>
                          )}
                        </td>

                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: prod.activo ? '#dcfce7' : '#fee2e2', color: prod.activo ? '#15803d' : '#991b1b' }}>
                            {prod.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>

                        <td style={{ padding: '10px' }}>
                          {estaEditando ? (
                            <>
                              <button 
                                onClick={() => guardarEdicion(prod.id)}
                                style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '3px', marginRight: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Guardar
                              </button>
                              <button 
                                onClick={() => setEditandoId(null)}
                                style={{ padding: '4px 8px', backgroundColor: '#cbd5e1', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => iniciarEdicion(prod)}
                                style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '3px', marginRight: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                              >
                                ✏️ Editar
                              </button>

                              <button 
                                onClick={() => handleToggleActivo(prod.id)}
                                style={{ padding: '4px 8px', backgroundColor: prod.activo ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: '3px', marginRight: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                              >
                                {prod.activo ? 'Inactivar' : 'Activar'}
                              </button>

                              <button 
                                onClick={() => handleEliminarProducto(prod.id, prod.nombre)}
                                style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VISTA GLOBAL DE TIENDAS */
        <div style={{ marginTop: '25px', backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Tenderos Registrados en TiendaControl</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px' }}>Tienda</th>
                <th style={{ padding: '12px' }}>Tendero</th>
                <th style={{ padding: '12px' }}>Ciudad</th>
                <th style={{ padding: '12px' }}>Total Productos</th>
                <th style={{ padding: '12px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {tiendas.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{t.nombre}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.tendero}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.ciudad}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{t.productosCount} ítems</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => setTiendaActiva(t)}
                      style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🛠️ Administrar Tienda
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;