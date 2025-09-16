import defaultCover from './assets/default-cover.png';
import './SongCard.css'

const SongCard = ({ song, artist, album, albumCoverUrl }) => {
  const coverToDisplay = albumCoverUrl || defaultCover;

  return (
    <div className="song-card">
      <div className="album-cover">
        <img src={coverToDisplay} alt={`Album cover for ${album}`} />
      </div>
      <div className="song-info">
        <h3>{song}</h3>
        <p className="artist">by {artist}</p>
        <p className="album">from <i>{album}</i></p>
      </div>
    </div>
  );
};

export default SongCard;