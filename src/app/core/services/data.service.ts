import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
constructor(private readonly http: HttpClient) {
  this.countries$ = this.http.get<Olympic[]>(this.olympicUrl).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
}

  /**
   * Renvoie les données de tous les pays
   * @returns un Observable contenant la liste des pays
   */
  getCountries(): Observable<Olympic[]> {
    return this.countries$;
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
