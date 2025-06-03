import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { PokemonCard } from './components/PokemonCard';
import 'bootstrap/dist/css/bootstrap.min.css';

// Tipos y regiones disponibles
const allTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const allRegions = [
  'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'
];

function App() {
  const [search, setSearch] = useState('');
  const [allPokemons, setAllPokemons] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);

  const [filterType, setFilterType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  const [newPokemon, setNewPokemon] = useState({pokemon_name: '', pokedex_id: '', pokemon_sprite: '', Type1: '', Type2: '', Region: ''});

  useEffect(() => {
    // Carga todos los Pokémon y el equipo actual desde Supabase
    const fetchPokemonsAndTeam = async () => {
      const { data: pokemonData, error: pokemonError } = await supabase.from('Pokemon').select('*');
      if (pokemonError) {
        console.error('Error fetching Pokemons:', pokemonError);
      } else {
        setAllPokemons(pokemonData);
      }

      const { data: teamData, error: teamError } = await supabase.from('Team').select('pokemon, Mote');
      if (teamError) {
        console.error('Error fetching team:', teamError);
      } else {
        const teamPokemon = teamData.map(t => {
          const poke = pokemonData.find(p => p.id_pokemon === t.pokemon);
          return poke ? { ...poke, Mote: t.Mote } : null;
        }).filter(Boolean);
        setSelectedTeam(teamPokemon);
      }
    };

    fetchPokemonsAndTeam();
  }, []);

  // Aplica filtros de nombre, tipo y región
  const filtered = allPokemons.filter(p => {
    const matchesName = p.pokemon_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === '' || p.Type1 === filterType || p.Type2 === filterType;
    const matchesRegion = filterRegion === '' || p.Region === filterRegion;
    return matchesName && matchesType && matchesRegion;
  });

  // Agrega un Pokémon al equipo
  const handleSelect = async (pokemon) => {
    if (selectedTeam.length >= 6) {
      alert('¡Tu equipo solo puede tener 6 Pokémon!');
      return;
    }

    const alreadySelected = selectedTeam.find(p => p.id_pokemon === pokemon.id_pokemon);
    if (!alreadySelected) {
      const mote = prompt(`Escribe un mote para ${pokemon.pokemon_name}:`, '');
      if (mote === null) return;

      const { error } = await supabase.from('Team').insert([{ pokemon: pokemon.id_pokemon, Mote: mote }]);
      if (error) {
        console.error('Error guardando en el equipo:', error);
        return;
      }

      setSelectedTeam([...selectedTeam, { ...pokemon, Mote: mote }]);
    }

    setSearch('');
    setFilterType('');
    setFilterRegion('');
  };

  // Elimina un Pokémon del equipo
  const handleRemove = async (id) => {
    const { error } = await supabase.from('Team').delete().eq('pokemon', id);
    if (error) {
      console.error('Error removing from team:', error);
      return;
    }
    setSelectedTeam(selectedTeam.filter(p => p.id_pokemon !== id));
  };

  // Agrega un nuevo Pokémon a la base
  const handleAddPokemon = async (e) => {
    e.preventDefault();
    const { pokemon_name, pokedex_id, pokemon_sprite, Type1, Region } = newPokemon;

    if (!pokemon_name || !pokedex_id || !pokemon_sprite || !Type1 || !Region) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const { error } = await supabase.from('Pokemon').insert([newPokemon]);
    if (error) {
      console.error('Error al insertar:', error);
      alert('Hubo un error al agregar el Pokémon.');
    } else {
      alert('¡Pokémon agregado exitosamente!');
      setNewPokemon({ pokemon_name: '', pokedex_id: '', pokemon_sprite: '', Type1: '', Type2: '', Region: '' });
      const { data } = await supabase.from('Pokemon').select('*');
      setAllPokemons(data);
    }
  };

  // Renombra un Pokémon del equipo
  const handleRename = async (pokemon) => {
    const newMote = prompt(`Nuevo mote para ${pokemon.pokemon_name}:`, pokemon.Mote || '');
    if (newMote === null) return;

    const { error } = await supabase
      .from('Team')
      .update({ Mote: newMote })
      .eq('pokemon', pokemon.id_pokemon);

    if (error) {
      console.error('Error actualizando mote:', error);
      alert('No se pudo actualizar el mote.');
      return;
    }

    const updatedTeam = selectedTeam.map(p =>
      p.id_pokemon === pokemon.id_pokemon ? { ...p, Mote: newMote } : p
    );
    setSelectedTeam(updatedTeam);
  };

  // Opciones únicas para selectores de tipo y región
  const typeOptions = [...new Set(allPokemons.flatMap(p => [p.Type1, p.Type2]).filter(Boolean))];
  const regionOptions = [...new Set(allPokemons.map(p => p.Region).filter(Boolean))];

  return (
    <div className="container py-4 text-white">
      <h1 className="text-center mb-4">Pokémon Team Builder</h1>

      {/* Filtros de búsqueda, tipo y región */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {typeOptions.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
          >
            <option value="">Todas las regiones</option>
            {regionOptions.map((region, idx) => (
              <option key={idx} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados filtrados al buscar */}
      {search || filterType || filterRegion ? (
        <ul className="list-group mb-4">
          {filtered.map((p) => (
            <li
              key={p.id_pokemon}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(p)}
              style={{ cursor: 'pointer' }}
            >
              {p.pokemon_name}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Vista del equipo actual */}
      <div className="d-flex flex-wrap justify-content-center">
        {selectedTeam.map((p) => (
          <div key={p.id_pokemon} className="position-relative m-2">
            <PokemonCard
              name={p.Mote ? `${p.Mote}` : p.pokemon_name}
              image={p.pokemon_sprite}
              type1={p.Type1}
              type2={p.Type2}
              pokedexId={p.pokedex_id}
              region={p.Region}
              onRename={() => handleRename(p)}
              onRemove={() => handleRemove(p.id_pokemon)}
            />
          </div>
        ))}
      </div>

      {/* Formulario para agregar nuevo Pokémon */}
      <h2 className="text-center mt-5 mb-3">Agregar nuevo Pokémon</h2>
      <form className="row g-3 mb-4 text-dark bg-white p-3 rounded shadow-sm" onSubmit={handleAddPokemon}>
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Nombre"
            value={newPokemon.pokemon_name}
            onChange={e => setNewPokemon({ ...newPokemon, pokemon_name: e.target.value })} />
        </div>

        <div className="col-md-4">
          <input type="number" className="form-control" placeholder="Pokédex ID"
            value={newPokemon.pokedex_id}
            onChange={e => setNewPokemon({ ...newPokemon, pokedex_id: e.target.value })} />
        </div>

        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="URL del sprite"
            value={newPokemon.pokemon_sprite}
            onChange={e => setNewPokemon({ ...newPokemon, pokemon_sprite: e.target.value })} />
        </div>

        <div className="col-md-4">
          <select className="form-select" value={newPokemon.Type1}
            onChange={e => setNewPokemon({ ...newPokemon, Type1: e.target.value })}>
            <option value="">Tipo 1</option>
            {allTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="col-md-4">
          <select className="form-select" value={newPokemon.Type2}
            onChange={e => setNewPokemon({ ...newPokemon, Type2: e.target.value })}>
            <option value="">Tipo 2 (opcional)</option>
            {allTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="col-md-4">
          <select className="form-select" value={newPokemon.Region}
            onChange={e => setNewPokemon({ ...newPokemon, Region: e.target.value })}>
            <option value="">Región</option>
            {allRegions.map((region, i) => <option key={i} value={region}>{region}</option>)}
          </select>
        </div>

        <div className="col-12 text-end">
          <button type="submit" className="btn btn-success">Agregar Pokémon</button>
        </div>
      </form>
    </div>
  );
}

export default App;
