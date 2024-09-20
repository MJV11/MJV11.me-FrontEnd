import util
import random
import math

# Your program should send TTLs in the range [1, TRACEROUTE_MAX_TTL] inclusive.
# Technically IPv4 supports TTLs up to 255, but in practice this is excessive.
# Most traceroute implementations cap at approximately 30.  The unit tests
# assume you don't change this number.
TRACEROUTE_MAX_TTL = 30

# Cisco seems to have standardized on UDP ports [33434, 33464] for traceroute.
# While not a formal standard, it appears that some routers on the internet
# will only respond with time exceeeded ICMP messages to UDP packets send to
# those ports.  Ultimately, you can choose whatever port you like, but that
# range seems to give more interesting results.
TRACEROUTE_PORT_NUMBER = 33434  # Cisco traceroute port number.

# Sometimes packets on the internet get dropped.  PROBE_ATTEMPT_COUNT is the
# maximum number of times your traceroute function should attempt to probe a
# single router before giving up and moving on.
PROBE_ATTEMPT_COUNT = 3

class IPv4:
    # Each member below is a field from the IPv4 packet header.  They are
    # listed below in the order they appear in the packet.  All fields should
    # be stored in host byte order.
    #
    # You should only modify the __init__() method of this class.
    version: int
    header_len: int  # Note length in bytes, not the value in the packet.
    tos: int         # Also called DSCP and ECN bits (i.e. on wikipedia).
    length: int      # Total length of the packet.
    id: int
    flags: int
    frag_offset: int
    ttl: int
    proto: int
    cksum: int
    src: str
    dst: str

    def __init__(self, buffer: bytes):
        # buffer into bitstring
        b = ''.join(format(byte, '08b') for byte in [*buffer])
        self.version = int(b[:4], 2)
        self.header_len = int(b[4:8], 2) * 4
        self.tos = int(b[8:16], 2)
        self.length = int(b[16:32], 2)
        self.id = int(b[32:48], 2)
        self.flags = int(b[48:51], 2) # 3
        self.frag_offset = int(b[51:64], 2) # 13
        self.ttl = int(b[64:72], 2)
        self.proto = int(b[72:80], 2)
        self.cksum = int(b[80:96], 2)

        def ip_address_from_bits(b) -> str:
            final = ''
            for i in range(4):
                final += "." + str(int(b[i*8:i*8+8], 2)) 
            return final[1:]
        
        self.src = ip_address_from_bits(b[96:128]) 
        self.dst = ip_address_from_bits(b[128:160])

    
    def __str__(self) -> str:
        return f"IPv{self.version} (tos 0x{self.tos:x}, ttl {self.ttl}, " + \
            f"id {self.id}, flags 0x{self.flags:x}, " + \
            f"offset {self.frag_offset}, " + \
            f"proto {self.proto}, header_len {self.header_len}, " + \
            f"len {self.length}, cksum 0x{self.cksum:x}) " + \
            f"{self.src} > {self.dst}"


class ICMP:
    # Each member below is a field from the ICMP header.  They are listed below
    # in the order they appear in the packet.  All fields should be stored in
    # host byte order.
    #
    # You should only modify the __init__() function of this class.
    type: int
    code: int
    cksum: int

    def __init__(self, buffer: bytes):
        # buffer into bitstring 
        b = ''.join(format(byte, '08b') for byte in [*buffer])
        self.type = int(b[:8], 2)
        self.code = int(b[8:16], 2)
        self.cksum = int(b[16:32], 2)

    def __str__(self) -> str:
        return f"ICMP (type {self.type}, code {self.code}, " + \
            f"cksum 0x{self.cksum:x})"


class UDP:
    # Each member below is a field from the UDP header.  They are listed below
    # in the order they appear in the packet.  All fields should be stored in
    # host byte order.
    #
    # You should only modify the __init__() function of this class.
    src_port: int
    dst_port: int
    len: int
    cksum: int

    def __init__(self, buffer: bytes):
        # buffer into bitstring 
        b = ''.join(format(byte, '08b') for byte in [*buffer])

        # all 16 bits
        self.src_port = int(b[:16], 2)
        self.dst_port = int(b[16:32], 2)
        self.len = int(b[32:48], 2)
        self.cksum = int(b[48:64], 2)

    def __str__(self) -> str:
        return f"UDP (src_port {self.src_port}, dst_port {self.dst_port}, " + \
            f"len {self.len}, cksum 0x{self.cksum:x})"


def traceroute(sendsock: util.Socket, recvsock: util.Socket, ip: str) \
        -> list[list[str]]:
    """ Run traceroute and returns the discovered path.
    Calls util.print_result() on the result of each TTL's probes to show
    progress.

    Arguments:
    sendsock -- This is a UDP socket you will use to send traceroute probes.
    recvsock -- This is the socket on which you will receive ICMP responses.
    ip -- This is the IP address of the end host you will be tracerouting.

    Returns:
    A list of lists representing the routers discovered for each ttl that was
    probed.  The ith list contains all of the routers found with TTL probe of
    i+1.   The routers discovered in the ith list can be in any order.  If no
    routers were found, the ith list can be empty.  If `ip` is discovered, it
    should be included as the final element in the list.
    """
    paths = [] 
    random_port = random.randint(0, 30)

    for ttl in range(1, TRACEROUTE_MAX_TTL+1):
        paths.append([])
        sendsock.set_ttl(ttl)
        for attempt in range(PROBE_ATTEMPT_COUNT):
            sendmsg = "T" * ttl #"payloads don't come back for some reason" #f"{trace_id}.{ttl}.{attempt}"
            sendsock.sendto(sendmsg.encode(), (ip, TRACEROUTE_PORT_NUMBER + random_port))
            print("Original encoded packet: ", sendmsg.encode())
            #print(f"Encoded Payload: {trace_id}.{ttl}.{attempt}")
    
    received_packets = []
    sent_packets = []
    for ttl in range(1, TRACEROUTE_MAX_TTL+1):
        for attempt in range(PROBE_ATTEMPT_COUNT + int(max(0, 1 * math.exp(01.3 * (ttl - 25))))//1): # some bullshit to wait long enough for a return packet
            if recvsock.recv_select(): 
                buf, address = recvsock.recvfrom()

                try:
                    ip_header = IPv4(buf[:20])
                    icmp_header = ICMP(buf[ip_header.header_len:ip_header.header_len + 8])
                    payload = buf[ip_header.header_len + 8:]
                    original_ip_header = IPv4(payload[:20])
                    original_UDP = UDP(payload[original_ip_header.header_len:original_ip_header.header_len + 16])
                except:
                    continue

                # validity check
                if not is_valid(icmp_header, ip_header, payload, ttl):
                    continue
                # duplicate check
                if original_UDP.dst_port != TRACEROUTE_PORT_NUMBER + random_port:
                    attempt-=1
                    continue
                if buf[28:] in received_packets and address[0] in paths[original_UDP.len - 9]:
                    attempt-=1
                    continue
                elif buf in sent_packets and address[0] in paths[original_UDP.len - 9]:
                    attempt-=1
                    continue
                else: 
                    sent_packets.append(buf)
                    received_packets.append(buf[28:])
                
                print("Received IP Header: ", ip_header)
                print("Received ICMP Header: ", icmp_header)
                print("Original IP Header: ", original_ip_header)
                print("Original UDP packet: ", original_UDP) 
                print("Original Payload: ", payload[original_ip_header.header_len + 16:], "\n")
                
                if address[0] not in paths[original_UDP.len - 9]:
                    paths[original_UDP.len - 9].append(address[0])

                if address[0] == ip:
                    paths = paths[:original_UDP.len - 8]
                    paths_set = do_cleanup(paths, ip)
                    return paths_set  # tracedroute
            
    paths_set = do_cleanup(paths, ip)

    return paths_set

def do_cleanup(paths, ip):
    # fix duplications errors from packets that send badly
    paths_set = []
    # for i in range(len(paths)):
    #     # first + dropped packets, but getting rid of duplicate return packets (it is impossible to have the same route with +1 depth)
    #     if i == 0 or paths[i] == [] or paths[i] != paths[i - 1]:
    #         paths_set.append((paths[i]))

    # while paths_set[-1] == []:
    #     paths_set.pop(-1)
    
    print("paths set", paths,"\nip:", ip)
    #return paths

    return paths

def is_valid_icmp(icmp_header):
    # b2: type
    if icmp_header.type not in [11, 3]:
        return False
    elif icmp_header.type == 11:
        # b3: code
        if icmp_header.code != 0:
            return False
    return True

def is_valid_ip(ip_header, ttl):
    # b4: ip protocol is ICMP
    if ip_header.proto != 1:
        return False
    return True

def is_valid_payload(payload):
    # b6: length
    if len(payload) < 8:
        return False
    return True

def is_valid(icmp_header, ip_header, payload, ttl):
    return is_valid_icmp(icmp_header) and is_valid_ip(ip_header, ttl) and is_valid_payload(payload)

if __name__ == '__main__':
    args = util.parse_args()
    ip_addr = util.gethostbyname(args.host)
    print(f"traceroute to {args.host} ({ip_addr})")
    traceroute(util.Socket.make_udp(), util.Socket.make_icmp(), ip_addr)