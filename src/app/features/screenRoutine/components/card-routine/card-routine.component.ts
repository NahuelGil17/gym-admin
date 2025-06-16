import { NgStyle, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
  OnInit,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { OrganizationThemeService } from '@core/services/organization-theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-card-routine',
  standalone: true,
  imports: [NgStyle, UpperCasePipe],
  templateUrl: './card-routine.component.html',
  styleUrls: ['./card-routine.component.css'],
})
export class CardRoutineComponent implements OnInit, AfterViewInit {
  @Input() routine: any;
  @Input() animationDelay = 0;
  @Input() backgroundColor = '';
  @ViewChildren('exerciseText') exerciseTexts!: QueryList<ElementRef>;
  @ViewChildren('exerciseList') exerciseLists!: QueryList<
    ElementRef<HTMLUListElement>
  >;

  organizationColors$: Observable<{primary: string, secondary: string} | null>;
  defaultColors = {
    primary: '#1565c0',
    secondary: '#18a29b'
  };

  constructor(private organizationThemeService: OrganizationThemeService) {
    this.organizationColors$ = this.organizationThemeService.getOrganizationColors();
  }

  ngOnInit() {
    if (!this.backgroundColor) {
      this.organizationColors$.subscribe(colors => {
        if (colors) {
          this.backgroundColor = colors.primary;
        } else {
          this.backgroundColor = this.defaultColors.primary;
        }
      });
    }
  }

  ngAfterViewInit() {
    this.animationScroll();
  }

  animationScroll() {
    this.exerciseLists.forEach((list: ElementRef<HTMLUListElement>) => {
      setInterval(() => {
        const el = list.nativeElement;
        if (el.scrollHeight > el.clientHeight) {
          // Calcular duración basada en el tamaño del contenido
          const scrollDistance = el.scrollHeight - el.clientHeight;
          const scrollDuration = this.calculateScrollDuration(scrollDistance);
          
          // Scroll hacia abajo con duración proporcional al contenido
          this.smoothScroll(el, scrollDistance, scrollDuration);
          
          setTimeout(() => {
            // Scroll hacia arriba
            this.smoothScroll(el, 0, environment.config.scrollTimeDown);
          }, scrollDuration + 2000); // Tiempo extra para ver el final
        }
      }, environment.config.scrollTimeDown * 3); // Doble del tiempo para completar ciclo
    });
  }

  // Calcula la duración del scroll basado en la altura del contenido
  calculateScrollDuration(scrollDistance: number): number {
    // Base: 10000ms (10 segundos) por cada 300px de contenido
    const baseRate = 10000 / 300;
    // Mínimo 15 segundos, máximo 60 segundos
    const calculatedDuration = Math.round(scrollDistance * baseRate);
    return Math.max(15000, Math.min(60000, calculatedDuration));
  }

  smoothScroll(element: HTMLElement, to: number, duration: number) {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = start + change * progress;
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  getAnimationDelay(index: number): string {
    const delay = index * 100; // 100ms entre cada uno
    return `${delay}ms`;
  }

  startRepeatingAnimation() {
    // Llamar a la animación cada 1 minuto (60000 ms)
    setInterval(() => {
      this.applyAnimation();
    }, 60000); // 1 minuto
  }

  applyAnimation() {
    const exerciseElements = this.exerciseTexts.toArray();

    // Reiniciar la animación: Primero, eliminar las clases de animación
    exerciseElements.forEach((textElement) => {
      textElement.nativeElement.classList.remove('slide-fade-effect');
    });

    // Aplicar la animación a todos los ejercicios al mismo tiempo
    exerciseElements.forEach((textElement) => {
      setTimeout(() => {
        textElement.nativeElement.classList.add('slide-fade-effect');
      }, 0); // Todos los ejercicios comienzan al mismo tiempo (sin delay)
    });
  }

  get cardStyle() {
    return {
      'animation-delay': `${this.animationDelay}ms`,
      'background-color': this.backgroundColor
    };
  }
}
