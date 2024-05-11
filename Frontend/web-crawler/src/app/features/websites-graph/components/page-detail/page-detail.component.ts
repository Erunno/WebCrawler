import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faComputerMouse } from '@fortawesome/free-solid-svg-icons';
import { GraphNode } from 'src/app/models/graph';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDetailComponent implements OnChanges {
  faMouse = faComputerMouse;

  @Input() node: GraphNode | undefined;
  @Input() allNodes: GraphNode[] | undefined;

  displayedNode: GraphNode | undefined;

  public ngOnChanges(): void {
    if (this.allNodes?.some((n) => this.node?.id === n.id)) {
      this.displayedNode = this.node;
    } else {
      this.displayedNode = undefined;
    }
  }
}
