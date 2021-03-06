import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const addFavoriteStatus = (isFavorite) => {
  if (isFavorite) {
    return '--active';
  }
};

const addFormatDuration = (time) => time.toString().padStart(2,'0');

const getDurationDate = (dateFrom, dateTo) => {
  const monthsDiff = dayjs(dateTo).diff(dateFrom,'month');
  let intermidateDate = dayjs(dateFrom).add(monthsDiff,'month');
  const daysDiff = dayjs(dateTo).diff(intermidateDate,'day');
  intermidateDate = intermidateDate.add(daysDiff,'day');
  const hoursDiff = dayjs(dateTo).diff(intermidateDate,'hour');
  const minutesDiff = dayjs(dateTo).diff(intermidateDate.add(hoursDiff,'hour'),'minute');

  if (monthsDiff > 0) {
    return `${addFormatDuration(monthsDiff)}M ${addFormatDuration(daysDiff)}D ${addFormatDuration(hoursDiff)}H ${addFormatDuration(minutesDiff)}M`;
  }
  if ( daysDiff > 0) {
    return `${addFormatDuration(daysDiff)}D ${addFormatDuration(hoursDiff)}H ${addFormatDuration(minutesDiff)}M`;
  }
  if (hoursDiff > 0) {
    return `${addFormatDuration(hoursDiff)}H ${addFormatDuration(minutesDiff)}M`;
  }
  return `${addFormatDuration(minutesDiff)}M`;
};

const createOfferTemplate = (offers) => {
  const offersTemplate = [];
  if(offers.length !== 0) {
    offers.forEach((offer) => {
      offersTemplate.push(
        `<li class="event__offer">
          <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </li>`);
    });
  }

  return offersTemplate.join(' ');
};

const createWaypointTemplate = (point, offers) => {
  const {basePrice, dateFrom, dateTo, destination, isFavorite, type} = point;
  const offersByType = offers.find((offer) => offer.type === point.type);

  return  `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${dayjs(dateFrom).format('YYYY-MM-DD')}">${dayjs(dateFrom).format('MMM D')}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type} ${destination.name}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${dayjs(dateFrom).format('DD/MM/YYYY HH:mm')}">${dayjs(dateFrom).format('HH:mm')}</time>
          &mdash;
          <time class="event__end-time" datetime="${dayjs(dateTo).format('DD/MM/YYYY HH:mm')}">${dayjs(dateTo).format('HH:mm')}</time>
        </p>
        <p class="event__duration">${getDurationDate(dateFrom, dateTo)}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${createOfferTemplate(offersByType.offers.filter((offer) => point.offers.includes(offer.id)))}
      </ul>
      <button class="event__favorite-btn event__favorite-btn${addFavoriteStatus(isFavorite)}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class WaypointView extends AbstractView {
  #point = null;
  #offers = null;

  constructor(point, offers) {
    super();
    this.#point = point;
    this.#offers = offers;
  }

  get template() {
    return createWaypointTemplate(this.#point, this.#offers);
  }

  setClickHandler = (callback) => {
    this._callback.click = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#clickHandler);
  };

  setFavoriteClickHandler = (callback) => {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  };

  #clickHandler = (evt) => {
    evt.preventDefault();
    this._callback.click();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };
}
