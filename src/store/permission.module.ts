import store from '@/store'
import { Module, VuexModule, Mutation, Action, getModule, MutationAction } from 'vuex-module-decorators'
import RoleType from '@/models/RoleType';
import { getToken } from '@/utils/auth';
import { AuthModule } from './auth.module';
import {constantRouterMap, asyncRouterMap} from '@/router';



function hasPermission(roles:number [], route: any) {
    if (route.meta && route.meta.roles) {
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        return true
    }
}

function filterAuthorityRouter(routes: any[], roles:number[]) {
    const res: any = [];
    routes.forEach(route => {
        const tmp = { ...route };
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAuthorityRouter(tmp.children, roles)
            }
            res.push(tmp)
        }
    });

    return res;
}


@Module({dynamic: true, store, name:'permission'})
class Permission extends VuexModule {
  public userType: number = 0;
  public routers: any = [];
  public addRouters: any = [];

  @Mutation
  public SET_ROUTERS(routers: []){
    this.addRouters = routers;
    this.routers = constantRouterMap.concat(routers);
  }

  @Mutation
  public REMOVE_ROUTERS(){
    this.routers = [];
  }

  @Mutation
  public SET_USERTYPE(type: number) {
    this.userType = type;
  }

  @Action({ commit: "SET_ROUTERS" })
  public async GenerateRoutes() {
      let accessedRouters: any = [];

      let userType: number = AuthModule.User.user_type;
      const roles: number[] = [ userType ];
      console.log(roles);

      accessedRouters = filterAuthorityRouter(asyncRouterMap, roles);

      console.log(accessedRouters);

      return accessedRouters;
  }

  @Action({ commit: 'REMOVE_ROUTERS' })
  public async RemoveRouters() {
      //removeGeneratedRouters();
      return;
  }


  @Action({ commit: 'SET_USERTYPE' })
  public SetUserType(type: number): number {
    return type;
  }

  /*
  @MutationAction({ mutate: ['userType'] })
  public SET_ROLE(type: number) {
    return {
      userType: type
    };
  }
  */
}

export const PermissionModule = getModule(Permission);