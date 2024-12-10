"""
Your awesome Distance Vector router for CS 168

Based on skeleton code by:
  MurphyMc, zhangwen0411, lab352
"""

import sim.api as api
from cs168.dv import (
    RoutePacket,
    Table,
    TableEntry,
    DVRouterBase,
    Ports,
    FOREVER,
    INFINITY,
)

class DVRouter(DVRouterBase):

    # A route should time out after this interval
    ROUTE_TTL = 15

    # -----------------------------------------------
    # At most one of these should ever be on at once
    SPLIT_HORIZON = False
    POISON_REVERSE = False
    # -----------------------------------------------

    # Determines if you send poison for expired routes
    POISON_EXPIRED = False

    # Determines if you send updates when a link comes up
    SEND_ON_LINK_UP = False

    # Determines if you send poison when a link goes down
    POISON_ON_LINK_DOWN = False

    def __init__(self):
        """
        Called when the instance is initialized.
        DO NOT remove any existing code from this method.
        However, feel free to add to it for memory purposes in the final stage!
        """
        assert not (
            self.SPLIT_HORIZON and self.POISON_REVERSE
        ), "Split horizon and poison reverse can't both be on"

        self.start_timer()  # Starts signaling the timer at correct rate.
        #print("starting test \n\n\n\n\n\n\n")
        # Contains all current ports and their latencies.
        # See the write-up for documentation.
        self.ports = Ports()

        # This is the table that contains all current routes
        self.table = Table()
        self.table.owner = self
        #t[h1] = TableEntry(dst=h1, port=p1, latency=10, expire_time=api.current_time()+20)
        #for host, entry in t.items(): # <-- This is how you iterate through a dict.
            #print("Route to {} has latency {}".format(host, entry.latency))

        ##### Begin Stage 10A #####
        self.history = {}
        ##### End Stage 10A #####

    def add_static_route(self, host, port):
        """
        Adds a static route to this router's table.

        Called automatically by the framework whenever a host is connected
        to this router.

        :param host: the host.
        :param port: the port that the host is attached to.
        :returns: nothing.
        """
        # `port` should have been added to `peer_tables` by `handle_link_up`
        # when the link came up.
        assert port in self.ports.get_all_ports(), "Link should be up, but is not."

        ##### Begin Stage 1 #####
        self.table[host] = TableEntry(dst=host, port=port, latency=self.ports.get_latency(port), expire_time=FOREVER)
        ##### End Stage 1 #####

    def handle_data_packet(self, packet, in_port):
        """
        Called when a data packet arrives at this router.

        You may want to forward the packet, drop the packet, etc. here.

        :param packet: the packet that arrived.
        :param in_port: the port from which the packet arrived.
        :return: nothing.
        """
        
        ##### Begin Stage 2 #####
        entry = self.table.get(packet.dst)

        # no route or latency to dest >= INFINITY, drop packet
        if entry and entry.latency < INFINITY:
            self.send(packet, port=entry.port)
        return
        ##### End Stage 2 #####

    def send_routes(self, force=False, single_port=None):
        """
        Send route advertisements for all routes in the table.

        :param force: if True, advertises ALL routes in the table;
                      otherwise, advertises only those routes that have
                      changed since the last advertisement.
               single_port: if not None, sends updates only to that port; to
                            be used in conjunction with handle_link_up.
        :return: nothing.
        """
        
        ##### Begin Stages 3, 6, 7, 8, 10 #####

        ports_to_advertise = [single_port] if single_port else self.ports.get_all_ports()
        
        for host, entry in self.table.items():
            for p in ports_to_advertise:

                # Rule 6: Count to Infinity -> round to infitinty
                advertised_latency = min(entry.latency, INFINITY)                    
                if p not in self.history:
                    self.history[p] = {}

                # Advertise route only if force=True or route has changed since last advertisement
                if force or self.history[p].get(host) != advertised_latency:
                    #print(f"host: {host}, port: {p}, latency: {advertised_latency}, self.history[p].get(host): {self.history[p].get(host)}")
                    if entry.port == p:
                        if self.POISON_REVERSE:
                            if force or self.history[p].get(host) != INFINITY:
                                self.send_route(p, host, INFINITY)
                                self.history[p][host] = INFINITY
                        elif self.SPLIT_HORIZON:
                            continue  # Skip sending the route back through the port it was learned from
                        else:
                            self.send_route(p, host, advertised_latency)
                            self.history[p][host] = advertised_latency
                    else:
                        self.send_route(p, host, advertised_latency)
                        self.history[p][host] = advertised_latency
                        #print(f"sent! a: {advertised_latency} h: {self.history[p][host]}")


        ##### End Stages 3, 6, 7, 8, 10 #####
        #.FF........FF.F.F......F....F.F
        #...........FF..................
        #.........FF.F..................

    def expire_routes(self):
        """
        Clears out expired routes from table.
        accordingly.
        """
        
        ##### Begin Stages 5, 9 #####
        things_to_pop = []
        for host, entry in self.table.items():
            if entry.expire_time == FOREVER:
                continue
            if entry.expire_time < api.current_time():
                if self.POISON_EXPIRED:
                    self.table[host] = TableEntry(dst=host, port=entry.port, latency=INFINITY, expire_time=api.current_time()+self.ROUTE_TTL)
                else:
                    things_to_pop.append(host)
        
        for h in things_to_pop:
            self.table.pop(h)

        return
        ##### End Stages 5, 9 #####

    def handle_route_advertisement(self, route_dst, route_latency, port):
        """
        Called when the router receives a route advertisement from a neighbor.

        :param route_dst: the destination of the advertised route.
        :param route_latency: latency from the neighbor to the destination.
        :param port: the port that the advertisement arrived on.
        :return: nothing.
        """
        
        ##### Begin Stages 4, 10 #####
        l = route_latency + self.ports.get_latency(port) 

        if route_dst not in self.table or \
            l < self.table[route_dst].latency or \
            self.table[route_dst].port == port:
            
            if route_dst in self.table:
                if self.table[route_dst].latency != l:
                    self.table[route_dst] = TableEntry(dst=route_dst, port=port, latency=l, expire_time=api.current_time() + self.ROUTE_TTL)
                    self.send_routes(force=False)
            else:
                self.table[route_dst] = TableEntry(dst=route_dst, port=port, latency=l, expire_time=api.current_time()+self.ROUTE_TTL)
                self.send_routes(force=False)
        return
        ##### End Stages 4, 10 #####

    def handle_link_up(self, port, latency):
        """
        Called by the framework when a link attached to this router goes up.

        :param port: the port that the link is attached to.
        :param latency: the link latency.
        :returns: nothing.
        """
        self.ports.add_port(port, latency)

        ##### Begin Stage 10B #####
        if self.SEND_ON_LINK_UP:
            self.send_routes(force=False, single_port=port)
        ##### End Stage 10B #####
        

    def handle_link_down(self, port):
        """
        Called by the framework when a link attached to this router goes down.

        :param port: the port number used by the link.
        :returns: nothing.
        """
        self.ports.remove_port(port)

        ##### Begin Stage 10B #####
        affected_routes = []

        for host, entry in list(self.table.items()): 
            if entry.port == port:
                affected_routes.append(host)

        #  poison / delete
        if self.POISON_ON_LINK_DOWN:
            for host in affected_routes:
                self.table[host] = TableEntry(dst=host, port=port, latency=INFINITY, expire_time=api.current_time() + self.ROUTE_TTL)    
        else:
            for host in affected_routes:
                self.table.pop(host)
                
        self.send_routes(force=False)
        ##### End Stage 10B #####

    # Feel free to add any helper methods!
