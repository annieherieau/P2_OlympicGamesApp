import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Olympic } from '../models/olympic.model';

/**
 * Centralise l'accès aux données et partage les données
 * chargées entre les pages.
 *
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  /** fichier mock des données */
  private readonly olympicUrl = './assets/mock/olympic.json';
  /** Observable partagé contenant les données des pays.  */
  private readonly countries$: Observable<Olympic[]>;

  /**
   * Prépare le chargement des données, déclenché au premier abonnement.
   * shareReplay partage la requête entre les abonnés et conserve la réponse
   * pour les prochains abonnements après un chargement réussi.
   *
   * @param http Client HTTP Angular
   */
  constructor(
    private readonly http: HttpClient,
    // pour le tri des connées
    @Inject(LOCALE_ID) private readonly locale: string,
  ) {
    this.countries$ = this.http
      .get<Olympic[]>(this.olympicUrl)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  /**
   * Renvoie les données de tous les pays, tri alphabétique
   * selon la langue de l'appli
   * @returns un Observable contenant la liste des pays
   */
  getCountries(): Observable<Olympic[]> {
    return this.countries$.pipe(
      map((countries) =>
        [...countries].sort((a, b) => {
          const first = a.country?.trim() || null;
          const second = b.country?.trim() || null;

          if (first === null && second === null) return 0;
          if (first === null) return 1;
          if (second === null) return -1;

          return first.localeCompare(second, this.locale, {
            sensitivity: 'base',
          });
        }),
      ),
    );
  }

  /**
   * Recherche un pays à partir de son identifiant
   * @param id Identifiant du pays recherché
   * @returns un Observable contenant
   */
  getCountryById(id: number): Observable<Olympic | undefined> {
    return this.getCountries().pipe(
      map((countries) => countries.find((country) => country.id === id)),
    );
  }
}
