import { container } from 'tsyringe';
import { AppService } from '../modules/app.service';

container.register("AppService", AppService);

export { container }