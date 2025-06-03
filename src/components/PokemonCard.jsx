import React from 'react';

export const PokemonCard = ({ name, image, type1, type2, pokedexId, region, onRename, onRemove }) => {
  return (
    <div className="card text-center shadow-sm bg-light text-dark" style={{ width: '12rem', fontSize: '0.9rem' }}>
      <img
        src={image}
        className="card-img-top"
        alt={name}
        style={{ padding: '0.5rem', height: '175px', objectFit: 'contain' }}
      />
      <div className="card-body p-3">
        <h6 className="card-title mb-2 fw-bold">{name}</h6>
        <p className="card-text mb-1"><strong>Pokedex:</strong> {pokedexId}</p>
        <p className="card-text mb-1"><strong>Type:</strong> {type1}{type2 ? ` / ${type2}` : ''}</p>
        <p className="card-text"><strong>Region:</strong> {region}</p>

        {onRename || onRemove ? (
          <div className="d-flex justify-content-between mt-2">
            {onRename && (
              <button className="btn btn-outline-secondary btn-sm me-1" onClick={onRename}>
                ✎ Renombrar
              </button>
            )}
            {onRemove && (
              <button className="btn btn-sm btn-danger" onClick={onRemove}>
                ✕ Eliminar
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PokemonCard;
