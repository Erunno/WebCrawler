import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { GraphComponent } from '../../components/graph/graph.component';
import { GraphLink, GraphNode } from 'src/app/models/graph';

@Component({
  selector: 'app-websites-graph',
  standalone: true,
  templateUrl: './websites-graph.component.html',
  styleUrls: ['./websites-graph.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, GraphComponent],
})
export class WebsitesGraphComponent implements OnInit {
  public nodes: GraphNode[] = [];
  public links: GraphLink[] = [];

  public constructor(private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    let i = 0;

    const interval = setInterval(() => {
      this.nodes = this.nodes.map((n) => ({ ...n }));
      this.links = this.links.map((l) => ({ ...l }));

      const id = i;

      this.nodes.push({
        id,
        label: `lab ${i}`,
        url: `url-${i}.com`,
      });

      this.getRandomElementsFromArray(this.nodes, 2).forEach((n) => {
        this.links.push({
          source: id,
          target: n.id,
        });
      });

      this.links = this.links.filter((l) => l.source != l.target);

      i++;

      this.cdr.detectChanges();

      if (i == 5) {
        clearInterval(interval);
      }
    }, 1000);

    // setInterval(() => {
    //   this.nodes = this.nodes.map((n) => ({ ...n }));
    //   this.links = this.links.map((l) => ({ ...l }));

    //   const toRemove = this.getRandomElementsFromArray(this.nodes, 1)[0];

    //   this.nodes = this.nodes.filter((n) => n.id !== toRemove.id);
    //   this.links = this.links.filter(
    //     (l) => l.source !== toRemove.id && l.target !== toRemove.id
    //   );

    //   this.cdr.detectChanges();
    // }, 5000);
  }

  private getRandomElementsFromArray<T>(array: T[], n: number) {
    array = [...array];

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.slice(0, n);
  }
}
